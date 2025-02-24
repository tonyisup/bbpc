import { getServerAuthSession } from "@/server/auth";
import { ProfileForm } from "./ProfileForm";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-5xl font-extrabold tracking-tight">Profile</h1>
      <div className="w-full max-w-md">
        <ProfileForm initialName={session.user.name ?? ""} />
      </div>
    </div>
  );
} 