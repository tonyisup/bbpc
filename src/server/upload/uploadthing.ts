import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { UploadThingError } from "uploadthing/server";
import { getServerAuthSession } from "../common/get-server-auth-session";
import { prisma } from "../db/client";
const f = createUploadthing();


// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  audioUploader: f({ audio: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, res }) => {
      // This code runs on your server before upload
      console.log("middleware");
      
      const session = await getServerAuthSession({ req, res });
      const user = session?.user;

      // If you throw, the user will not be able to upload
      if (!user?.id) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const savedAudioMessage = await prisma.audioMessage.create({
        data: {
          userId: metadata.userId,
          url: file.url,
        }
      })

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedId: savedAudioMessage.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
