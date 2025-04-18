import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { z } from "zod";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getServerAuthSession();
      const user = session?.user;

      if (!user?.id) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update user's image in database
      await db.user.update({
        where: { id: metadata.userId },
        data: { image: file.url }
      });
    }),

  audioUploader: f({ audio: { maxFileSize: "8MB" } })
    .input(z.object({ episodeId: z.string().optional(), assignmentId: z.string().optional() }))
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      // This code runs on your server before upload
      console.log("middleware");
      
      const session = await getServerAuthSession();
      const user = session?.user;

      // If you throw, the user will not be able to upload
      if (!user?.id) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { 
        userId: user.id, 
        episodeId: input.episodeId, 
        assignmentId: input.assignmentId 
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      let savedAudioMessageId;
      if (metadata.episodeId) {
        const savedAudioMessage = await db.audioEpisodeMessage.create({
          data: {
            userId: metadata.userId,
            url: file.url,
            episodeId: metadata.episodeId,
          }
        });
        savedAudioMessageId = savedAudioMessage.id;
      } else if (metadata.assignmentId) {
        const savedAudioMessage = await db.audioMessage.create({
          data: {
            userId: metadata.userId,
            url: file.url,
            assignmentId: metadata.assignmentId,
          }
        });
        savedAudioMessageId = savedAudioMessage.id;
      }

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedId: savedAudioMessageId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
