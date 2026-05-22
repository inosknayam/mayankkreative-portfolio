import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <>
      <Navbar session={session} />
      <DashboardClient session={session} />
    </>
  );
}
