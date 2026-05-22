import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { CheckOutClient } from "./CheckOutClient";

export default async function CheckOutPage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <>
      <Navbar session={session} />
      <CheckOutClient session={session} />
    </>
  );
}
