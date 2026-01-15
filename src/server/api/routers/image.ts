import { cache } from "react";

import { z } from "zod";

import { listObjects, parseDimensionsFromKey, type S3Object } from "@/lib/s3";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const PAGE_SIZE = 12;
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

const cachedListObjects = cache(async () => {
  return listObjects();
});

async function filterImageObjects(objects: S3Object[]) {
  return objects.filter((obj) => {
    const ext = obj.key.split(".").pop()?.toLowerCase();
    return ext && IMAGE_EXTENSIONS.has(ext);
  });
}

export const imageRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const allObjects = await cachedListObjects();
      const imageObjects = await filterImageObjects(allObjects);

      const sortedObjects = imageObjects.sort(
        (a, b) =>
          (b.lastModified?.getTime() ?? 0) - (a.lastModified?.getTime() ?? 0),
      );

      const startIndex = input.cursor
        ? sortedObjects.findIndex((obj) => obj.key === input.cursor) + 1
        : 0;

      const paginatedObjects = sortedObjects.slice(
        startIndex,
        startIndex + PAGE_SIZE,
      );

      const imagesWithDimensions = paginatedObjects.map((obj) => ({
        ...obj,
        dimensions: parseDimensionsFromKey(obj.key),
      }));

      const nextCursor =
        paginatedObjects.length === PAGE_SIZE
          ? (paginatedObjects[paginatedObjects.length - 1]?.key ?? null)
          : null;

      return {
        images: imagesWithDimensions,
        nextCursor,
        totalCount: imageObjects.length,
      };
    }),

  count: publicProcedure.query(async () => {
    const allObjects = await cachedListObjects();
    const imageObjects = await filterImageObjects(allObjects);
    return imageObjects.length;
  }),
});
