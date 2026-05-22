import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { AttendanceClient } from "./AttendanceClient";

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <>
      <Navbar session={session} />
      <AttendanceClient />
    </>
  );
}
