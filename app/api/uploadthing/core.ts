import { auth } from "@/auth";
import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB" },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: session?.user?.id };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),
};

export type OurFileRouter = typeof ourFileRouter;
