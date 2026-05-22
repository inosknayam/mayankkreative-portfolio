import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { canManageStaff } from "@/lib/rbac";
import { Navbar } from "@/components/Navbar";
import { StaffAdminClient } from "./StaffAdminClient";

export default async function StaffAdminPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (!canManageStaff(session)) redirect("/dashboard");

  return (
    <>
      <Navbar session={session} />
      <StaffAdminClient />
    </>
  );
}
