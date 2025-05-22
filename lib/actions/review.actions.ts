import { z } from "zod";
import { insertReviewSchema } from "../validators";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants";

export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>,
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("user is not authenticated");
    }

    // validate and store review data and userId
    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user?.id,
    });
    // get the product being reviewed
    const product = await prisma.product.findFirst({
      where: {
        id: review.productId,
      },
    });

    if (!product) throw new Error("product not found");
    // check if user has already reviewed this product
    const reviewExists = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId,
      },
    });

    // if review exists, update it, otherwise create a new one
    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        // update the review
        await tx.review.update({
          where: {
            id: reviewExists.id,
          },
          data: {
            description: review.description,
            title: review.title,
            rating: review.rating,
          },
        });
      } else {
        // create a new review
        await tx.review.create({ data: review });
      }

      // get the average rating
      const averageRating = await tx.review.aggregate({
        _avg: {
          rating: true,
        },
        where: {
          productId: review.productId,
        },
      });

      // get the number of reviews
      const numReviews = await tx.review.count({
        where: {
          productId: review.productId,
        },
      });

      // update rating and number of reviews
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews: numReviews,
        },
      });
    });
    revalidatePath(ROUTES.product.detail(product.slug));
    return {
      success: true,
      message: "review updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
