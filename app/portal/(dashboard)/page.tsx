import { redirect } from "next/navigation";

/** The portal opens on the funnel; every other view is its own tab route. */
export default function PortalIndexPage() {
  redirect("/portal/funnel");
}
