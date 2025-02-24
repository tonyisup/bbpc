import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/server/upload/uploadthing";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
}); 