import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { canManageStaff } from "@/lib/rbac";
import { Navbar } from "@/components/Navbar";
import { RolesAdminClient } from "./RolesAdminClient";

export default async function RolesAdminPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (!canManageStaff(session)) redirect("/dashboard");

  return (
    <>
      <Navbar session={session} />
      <RolesAdminClient />
    </>
  );
}
