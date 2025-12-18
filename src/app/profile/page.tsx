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

  // Fetch the user's basic data and syllabus
  const user = await db.user.findFirst({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
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

  if (!user) {
    redirect("/api/auth/signin");
  }

  // Fetch the user's point history separately with targeted selects
  const pointsData = await db.point.findMany({
    where: { userId: user.id },
    orderBy: { earnedOn: 'desc' },
    select: {
      id: true,
      reason: true,
      earnedOn: true,
      adjustment: true,
      GamePointType: {
        select: {
          title: true,
          points: true,
          description: true,
        }
      },
      AssignmentPoints: {
        take: 1,
        select: {
          Assignment: {
            select: {
              id: true,
              Episode: {
                select: { id: true, number: true, title: true }
              },
              Movie: {
                select: { title: true }
              }
            }
          }
        }
      },
      GamblingPoints: {
        take: 1,
        select: {
          Assignment: {
            select: {
              id: true,
              Episode: {
                select: { id: true, number: true, title: true }
              },
              Movie: {
                select: { title: true }
              }
            }
          }
        }
      },
      Guess: {
        take: 1,
        select: {
          AssignmentReview: {
            select: {
              Assignment: {
                select: {
                  id: true,
                  Episode: {
                    select: { id: true, number: true, title: true }
                  },
                  Movie: {
                    select: { title: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  // Fetch gambling history separately
  const gamblingHistory = await db.gamblingPoints.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      assignmentId: true,
      points: true,
      createdAt: true,
      successful: true,
      Assignment: {
        select: {
          id: true,
          Movie: {
            select: {
              title: true,
              year: true
            }
          }
        }
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
        <PointHistory points={pointsData.map(p => ({
          ...p,
          earnedOn: p.earnedOn.toISOString()
        })) ?? []} />
        <GamblingHistory history={gamblingHistory as any} />

      </div>
      <SignOutButton />
    </div>
  );
}