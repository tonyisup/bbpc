import { getServerAuthSession } from "@/server/auth";
import { ProfileForm } from "./ProfileForm";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import SignOutButton from "@/components/SignOutButton";
import UserPoints from "@/components/UserPoints";
import { GamblingHistory } from "@/components/GamblingHistory";
import SyllabusPreview from "@/components/SyllabusPreview";
import Link from "next/link";
import { Pencil } from "lucide-react";

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
      },
      syllabus: {
        include: {
          Movie: true
        },
        orderBy: {
          order: 'desc'
        },
        take: 3
      }
    }
  });

  const syllabusCount = await db.syllabus.count({
    where: {
      userId: session.user.id
    }
  });

  return (
    <div className="container flex flex-col items-start justify-center gap-12 px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">{session.user.email}</h1>

      <ProfileForm
        initialName={session.user.name ?? ""}
        initialImage={session.user.image}
      />
      <div className="flex flex-col gap-4 w-full justify-center items-center">
        <h2 className="text-xl font-bold tracking-tight self-start">Game Stuff</h2>
        <UserPoints points={Number(user?.points) ?? null} />
        <GamblingHistory history={user?.gamblingPoints ?? []} />
      </div>
      <div className="flex flex-col gap-4 w-full justify-center items-center">
        <h2 className="text-xl font-bold tracking-tight self-start">My Syllabus</h2>
        <div className="flex gap-4 w-full items-center">
          <Link href="/syllabus"><Pencil className="w-4 h-4" /></Link>
          <SyllabusPreview count={syllabusCount} syllabus={user?.syllabus ?? []} />
        </div>
      </div>
      <SignOutButton />
    </div>
  );
} 