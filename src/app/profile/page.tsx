import { getServerAuthSession } from "@/server/auth";
import { ProfileForm } from "./ProfileForm";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import SignOutButton from "@/components/SignOutButton";
import UserPoints from "@/components/UserPoints";

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // Fetch the user's data including points
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-5xl font-extrabold tracking-tight">Profile</h1>
      <div className="w-full max-w-md flex flex-col gap-4">
        <ProfileForm initialName={session.user.name ?? ""} />
        <UserPoints points={user?.points ?? null} />
      </div>    
      <SignOutButton />
    </div>
  );
} 