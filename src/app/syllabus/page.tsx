import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import SyllabusManager from "@/components/SyllabusManager";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SyllabusPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // Fetch the user's syllabus with all movies
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      syllabus: {
        include: {
          Movie: true
        },
        orderBy: {
          order: 'desc'
        }
      }
    }
  });

  return (
    <div className="container flex flex-col gap-4 p-4">
      <SyllabusManager
        initialSyllabus={user?.syllabus ?? []}
        userId={session.user.id}
      />
    </div>
  );
} 