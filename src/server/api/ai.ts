import { db } from "@/server/db";
import { type AudioMessage } from "@prisma/client";

export async function createGuessesFromAi(audioMessage: AudioMessage) {
  const hosts = await db.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            admin: true
          }
        }
      }
    }
  });

  for (const host of hosts) {
    const assignmentReviews = await db.assignmentReview.findMany({
        where: {
            assignmentId: audioMessage.assignmentId,
            Review: {
                is: {
                    userId: host.id
                }
            }
        },
        select: {
            id: true
        }
    });

    // Check if a guess already exists for this user and assignment
    const existingGuess = await db.guess.findFirst({
        where: {
            userId: audioMessage.userId,
            assignmntReviewId: {
                in: assignmentReviews.map(ar => ar.id)
            },
        }
    });

    if (!existingGuess) {
        // TODO: Implement AI logic to extract guesses from audio message
        // 1. Transcribe the audio message to text.
        // 2. Analyze the text to identify the user's guesses for each host.
        // 3. For each guess, find the corresponding rating in the database.
        // 4. Create a new guess in the database using the SubmitGuess stored procedure.
    }
  }
}
