import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { CheckInClient } from "./CheckInClient";

export default async function CheckInPage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <>
      <Navbar session={session} />
      <CheckInClient session={session} />
    </>
  );
}
