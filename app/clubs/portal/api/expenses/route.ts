import { NextResponse } from "next/server";
import { parseExpense, readEvents, readExpenses, writeExpenses } from "@/lib/portal/store";
import { rollupByCategory, rollupByEvent, summarize } from "@/lib/portal/compute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

async function payload() {
  const [expenses, events] = await Promise.all([readExpenses(), readEvents()]);
  return {
    ok: true,
    expenses,
    events,
    totals: summarize(expenses),
    categories: rollupByCategory(expenses),
    byEvent: rollupByEvent(expenses, events),
  };
}

export async function GET() {
  try {
    return NextResponse.json(await payload());
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const expenses = await readExpenses();
    const created = parseExpense(body);
    if (!created.lineItem) throw new Error("lineItem is required");
    await writeExpenses([...expenses, created]);
    return NextResponse.json(await payload(), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: unknown };
    if (typeof body.id !== "string" || !body.id) throw new Error("id is required");
    const expenses = await readExpenses();
    const index = expenses.findIndex((row) => row.id === body.id);
    if (index < 0) {
      return NextResponse.json({ ok: false, error: `No expense ${body.id}` }, { status: 404 });
    }
    const updated = parseExpense(body, expenses[index]);
    const next = [...expenses];
    next[index] = updated;
    await writeExpenses(next);
    return NextResponse.json(await payload());
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) throw new Error("id is required");
    const expenses = await readExpenses();
    const next = expenses.filter((row) => row.id !== id);
    if (next.length === expenses.length) {
      return NextResponse.json({ ok: false, error: `No expense ${id}` }, { status: 404 });
    }
    await writeExpenses(next);
    return NextResponse.json(await payload());
  } catch (error) {
    return fail(error);
  }
}
