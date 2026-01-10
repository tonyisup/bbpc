import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import SyllabusManager from "@/components/SyllabusManager";
import { Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
          movie: true,
          assignment: {
            include: {
              episode: true
            }
          }
        },
        orderBy: {
          order: 'desc'
        }
      }
    }
  });

  return (
    <div className="container flex flex-col gap-4 p-4">
      <h1 className="text-3xl font-extrabold tracking-tight text-center flex justify-center items-center gap-2">
        My Syllabus
        <Popover>
          <PopoverTrigger>
            <Info className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent>
            <p>When you win the weekly bonus spin, we will assign the next movie from this list.</p>
          </PopoverContent>
        </Popover>
      </h1>
      <SyllabusManager
        initialSyllabus={user?.syllabus ?? []}
        userId={session.user.id}
      />
    </div>
  );
} 