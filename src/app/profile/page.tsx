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
import { calculateUserPoints, getCurrentSeasonID } from "@/utils/points";
import PointHistory from "@/components/PointHistory";

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session || !session.user || !session.user.email) {
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
          movie: true
        },
        orderBy: {
          order: 'desc'
        },
        take: 3
      }
    }
  });

  if (!user) {
    console.warn(`ProfilePage: User not found for email ${session.user.email}`);
    return (
      <div className="container flex flex-col items-center justify-center min-h-[50vh] px-4 py-16">
        <h1 className="text-2xl font-bold">User Not Found</h1>
        <p className="mt-4 text-muted-foreground">We couldn't find your profile information. Please try signing in again.</p>
        <div className="mt-8">
          <SignOutButton />
        </div>
      </div>
    );
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
      season: {
        select: {
          id: true,
          title: true,
          startedOn: true,
          endedOn: true,
        }
      },
      gamePointType: {
        select: {
          title: true,
          points: true,
          description: true,
        }
      },
      assignmentPoints: {
        take: 1,
        select: {
          assignment: {
            select: {
              id: true,
              episode: {
                select: { id: true, number: true, title: true }
              },
              movie: {
                select: { title: true }
              }
            }
          }
        }
      },
      gamblingPoints: {
        take: 1,
        select: {
          assignment: {
            select: {
              id: true,
              episode: {
                select: { id: true, number: true, title: true }
              },
              movie: {
                select: { title: true }
              }
            }
          },
          gamblingType: {
            select: {
              title: true
            }
          }
        }
      },
      guesses: {
        take: 1,
        select: {
          assignmentReview: {
            select: {
              assignment: {
                select: {
                  id: true,
                  episode: {
                    select: { id: true, number: true, title: true }
                  },
                  movie: {
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
      gamblingTypeId: true,
      points: true,
      createdAt: true,
      status: true,
      gamblingType: {
        select: {
          id: true,
          title: true,
          lookupId: true,
        }
      }
    }
  });

  const syllabusCount = await db.syllabus.count({
    where: {
      userId: user.id,
      assignmentId: null
    }
  });

  const points = await calculateUserPoints(db, user.email ?? "", undefined);
  const currentSeasonId = await getCurrentSeasonID(db);

  return (
    <div className="container flex flex-col items-start justify-center gap-12 px-4 py-16">
      <h1 className="md:text-3xl text-2xl font-extrabold tracking-tight">{session.user.email}</h1>

      <ProfileForm
        initialName={session.user.name ?? ""}
        initialImage={session.user.image}
      />
      <div className="flex flex-col gap-4 w-full justify-center items-center">
        <h2 className="text-xl font-bold tracking-tight self-start">My Syllabus</h2>
        <div className="flex gap-4 w-full items-center">
          <Link href="/syllabus"><Pencil className="w-4 h-4" /></Link>
          <SyllabusPreview count={syllabusCount} syllabus={user.syllabus} />
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full justify-center items-center">
        <h2 className="text-xl font-bold tracking-tight self-start">Game Stuff</h2>
        <UserPoints points={points} />
        <PointHistory
          currentSeasonId={currentSeasonId}
          points={pointsData.map(p => ({
            ...p,
            season: p.season ? {
              ...p.season,
              startedOn: p.season.startedOn?.toISOString() ?? null,
              endedOn: p.season.endedOn?.toISOString() ?? null,
            } : null,
            earnedOn: p.earnedOn.toISOString()
          })) ?? []}
        />
      </div>
      <SignOutButton />
    </div>
  );
}