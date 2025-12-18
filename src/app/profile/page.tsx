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
import { calculateUserPoints } from "@/utils/points";
import PointHistory from "@/components/PointHistory";

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // Fetch the user's data including points
  const user = await db.user.findFirst({
    where: { email: session.user.email },
    include: {
      Point: {
        include: {
          Season: true,
          GamePointType: true,
          AssignmentPoints: {
            include: {
              Assignment: {
                include: {
                  Episode: true,
                  Movie: true
                }
              }
            }
          },
          GamblingPoints: {
            include: {
              Assignment: {
                include: {
                  Episode: true,
                  Movie: true
                }
              }
            }
          },
          Guess: {
            include: {
              AssignmentReview: {
                include: {
                  Assignment: {
                    include: {
                      Episode: true,
                      Movie: true
                    }
                  }
                }
              }
            }
          }
        }
      },
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
        where: {
          assignmentId: null
        },
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
      userId: user?.id,
      assignmentId: null
    }
  });

  const points = await calculateUserPoints(db, user?.email ?? '', undefined);

  return (
    <div className="container flex flex-col items-start justify-center gap-12 px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">{session.user.email}</h1>

      <ProfileForm
        initialName={session.user.name ?? ""}
        initialImage={session.user.image}
      />
      <div className="flex flex-col gap-4 w-full justify-center items-center">
        <h2 className="text-xl font-bold tracking-tight self-start">My Syllabus</h2>
        <div className="flex gap-4 w-full items-center">
          <Link href="/syllabus"><Pencil className="w-4 h-4" /></Link>
          <SyllabusPreview count={syllabusCount} syllabus={user?.syllabus ?? []} />
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full justify-center items-center">
        <h2 className="text-xl font-bold tracking-tight self-start">Game Stuff</h2>
        <UserPoints points={points} />
        <PointHistory points={user?.Point.map(p => ({
          ...p,
          earnedOn: p.earnedOn.toISOString()
        })) ?? []} />
        <GamblingHistory history={user?.gamblingPoints ?? []} />

      </div>
      <SignOutButton />
    </div>
  );
}