'use client';

import { ProfileForm } from "./ProfileForm";
import SignOutButton from "@/components/SignOutButton";
import UserPoints from "@/components/UserPoints";
import { GamblingHistory } from "@/components/GamblingHistory";
import SyllabusPreview from "@/components/SyllabusPreview";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin");
    },
  });

  const { data: user } = api.user.me.useQuery();
  const { data: syllabusCount } = api.syllabus.count.useQuery();

  if (!session?.user) return null;

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
          <SyllabusPreview count={syllabusCount ?? 0} syllabus={user?.syllabus ?? []} />
        </div>
      </div>
      <SignOutButton />
    </div>
  );
}
