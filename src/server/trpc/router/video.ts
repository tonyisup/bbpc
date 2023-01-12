import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const videoRouter = router({
  search: publicProcedure
    .input(z.object({searchTerm: z.string()}))
    .query(async (req) => {
      return await req.ctx.yt.getVideos(req.input.searchTerm)
    })
})