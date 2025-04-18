import { getServerAuthSession } from "@/server/auth";
import { ProfileForm } from "./ProfileForm";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import SignOutButton from "@/components/SignOutButton";
import UserPoints from "@/components/UserPoints";
import { GamblingHistory } from "@/components/GamblingHistory";

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // Fetch the user's data including points
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      gamblingPoints: {
        include: {
          Assignment: {
            include: {
              Movie: true
            }
          }
        }
      }
    }
  });

  return (
    <div className="container flex flex-col items-start justify-center gap-12 px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">{session.user.email}</h1>

      <ProfileForm
        initialName={session.user.name ?? ""}
        initialImage={session.user.image}
      />

      <h2 className="text-xl font-bold tracking-tight">Game Stuff</h2>
      <UserPoints points={Number(user?.points) ?? null} />
      <GamblingHistory history={user?.gamblingPoints ?? []} />
      <SignOutButton />
    </div>
  );
} 