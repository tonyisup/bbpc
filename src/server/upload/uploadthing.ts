import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { UploadThingError } from "uploadthing/server";
import { getServerAuthSession } from "../common/get-server-auth-session";
import { prisma } from "../db/client";
import { z } from "zod";
const f = createUploadthing();


// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  audioUploader: f({ audio: { maxFileSize: "8MB" } })
    .input(z.object({ episodeId: z.string().optional(), assignmentId: z.string().optional() }))
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, res, input }) => {
      // This code runs on your server before upload
      console.log("middleware");
      
      const session = await getServerAuthSession({ req, res });
      const user = session?.user;

      // If you throw, the user will not be able to upload
      if (!user?.id) throw new UploadThingError("Unauthorized");

      const episodeId = input.episodeId;
      const assignmentId = input.assignmentId;

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id, episodeId: episodeId, assignmentId: assignmentId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      let savedAudioMessageId;
      if (metadata.episodeId) {
        const savedAudioMessage = await prisma.audioEpisodeMessage.create({
          data: {
          userId: metadata.userId,
          url: file.url,
          }
        })
        savedAudioMessageId = savedAudioMessage.id;
      } else if (metadata.assignmentId) {
        const savedAudioMessage = await prisma.audioMessage.create({
          data: {
            userId: metadata.userId,
            url: file.url,
          }
        })
        savedAudioMessageId = savedAudioMessage.id;
      }

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedId: savedAudioMessageId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
