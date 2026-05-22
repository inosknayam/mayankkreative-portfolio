import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { ChildrenAdminClient } from "./ChildrenAdminClient";

export default async function ChildrenAdminPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.permission_level < 2) redirect("/dashboard");

  return (
    <>
      <Navbar session={session} />
      <ChildrenAdminClient />
    </>
  );
}
