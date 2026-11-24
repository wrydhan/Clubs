import { NextResponse } from "next/server";
import { parseEvent, readEvents, readExpenses, writeEvents } from "@/lib/portal/store";
import { rollupByEvent } from "@/lib/portal/compute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

async function payload() {
  const [events, expenses] = await Promise.all([readEvents(), readExpenses()]);
  return { ok: true, events, byEvent: rollupByEvent(expenses, events) };
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
    const events = await readEvents();
    const created = parseEvent(body);
    if (!created.name || !created.date || !created.venue || !created.owner) {
      throw new Error("name, date, venue and owner are required");
    }
    await writeEvents([...events, created]);
    return NextResponse.json(await payload(), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: unknown };
    if (typeof body.id !== "string" || !body.id) throw new Error("id is required");
    const events = await readEvents();
    const index = events.findIndex((event) => event.id === body.id);
    if (index < 0) {
      return NextResponse.json({ ok: false, error: `No event ${body.id}` }, { status: 404 });
    }
    const updated = parseEvent(body, events[index]);
    const next = [...events];
    next[index] = updated;
    await writeEvents(next);
    return NextResponse.json(await payload());
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) throw new Error("id is required");
    const events = await readEvents();
    const next = events.filter((event) => event.id !== id);
    if (next.length === events.length) {
      return NextResponse.json({ ok: false, error: `No event ${id}` }, { status: 404 });
    }
    await writeEvents(next);
    return NextResponse.json(await payload());
  } catch (error) {
    return fail(error);
  }
}
