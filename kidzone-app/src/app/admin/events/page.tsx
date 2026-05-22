import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { canManageEvents } from "@/lib/rbac";
import { Navbar } from "@/components/Navbar";
import { EventsAdminClient } from "./EventsAdminClient";

export default async function EventsAdminPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (!canManageEvents(session)) redirect("/dashboard");

  return (
    <>
      <Navbar session={session} />
      <EventsAdminClient />
    </>
  );
}
