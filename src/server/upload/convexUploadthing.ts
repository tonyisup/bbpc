import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import {
  fetchActionForSignedInUser,
  publicActionReference,
} from "@/server/convex/client";

const f = createUploadthing();
const BBPC_CLIENT_API_VERSION = "0.1.0";

const actionGateReference = publicActionReference<{
  clientApiVersion: string;
}>("identity/profile:actionGateProbe");

export const convexFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const gate = await fetchActionForSignedInUser(
        actionGateReference,
        { clientApiVersion: BBPC_CLIENT_API_VERSION }
      );
      if (gate === null) {
        throw new UploadThingError("Unauthorized");
      }
      return {};
    })
    .onUploadComplete(async ({ file }) => ({
      uploaded: true as const,
      fileKey: file.key,
    })),
} satisfies FileRouter;
