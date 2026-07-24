import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

import { CallContent } from "./CallContent";

export default async function SqlCallPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return <CallContent />;
}
