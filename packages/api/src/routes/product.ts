import { optUserProcedure, router } from "@repo/api/trpc";
import { z } from "zod";

export const departments = [
  "Automotive",
  "Baby",
  "Beauty",
  "Books",
  "Clothing",
  "Computers",
  "Electronics",
  "Games",
  "Garden",
  "Grocery",
  "Health",
  "Home",
  "Industrial",
  "Jewelry",
  "Kids",
  "Movies",
  "Music",
  "Outdoors",
  "Shoes",
  "Sports",
  "Tools",
  "Toys",
] as const;

export const product = router({
  get: optUserProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input: { id }, ctx: { db, user } }) => {
      const product = await db.product.findUnique({ where: { id } });
      return product !== null
        ? {
            cart: user?.cart.find(({ productId }) => productId === product.id),
            ...product,
          }
        : null;
    }),
  find: optUserProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(25),
          cursor: z.string().uuid().nullish(),
          department: z.string().nullish(),
          query: z.string().nullish(),
          sort: z.enum(["price", "added", "relevance"]).nullish(),
          order: z.enum(["desc", "asc"]).nullish(),
          minPrice: z.number().nullish(),
          maxPrice: z.number().nullish(),
          minRating: z.number().nullish(),
          maxRating: z.number().nullish(),
        })
        .transform(
          (
            obj,
          ): typeof obj & {
            sort: "price" | "added" | "relevance";
            order: "asc" | "desc";
          } => {
            const transformed = {
              ...obj,
              ...(obj.query && { query: obj.query.split(/\s+/).join(" & ") }),
              sort: obj.sort ?? "added",
              order: obj.order ?? "desc",
            };
            if (!obj.sort && obj.query) {
              transformed.sort = "relevance";
            }
            return transformed;
          },
        ),
    )
    .query(
      async ({
        input: {
          department,
          limit,
          cursor,
          query,
          sort,
          order,
          minPrice,
          maxPrice,
          minRating,
          maxRating,
        },
        ctx: { db, user },
      }) => {
        const products = (
          await db.product.findMany({
            where: {
              ...(department && department !== "All" && { department }),
              ...(query && {
                name: { search: query },
                description: { search: query },
              }),
              ...((minPrice || maxPrice) && {
                price: {
                  ...(minPrice && { gte: minPrice }),
                  ...(maxPrice && { lte: maxPrice }),
                },
              }),
              ...((minRating || maxRating) && {
                id: {
                  in: (
                    await db.review.groupBy({
                      by: ["productId"],
                      having: {
                        rating: {
                          _avg: {
                            ...(minRating && { gte: minRating }),
                            ...(maxRating && { lte: maxRating }),
                          },
                        },
                      },
                    })
                  ).map((review) => review.productId),
                },
              }),
            },
            orderBy:
              query && sort === "relevance"
                ? {
                    _relevance: {
                      fields: ["name", "description"],
                      search: query,
                      sort: order,
                    },
                  }
                : { [sort === "relevance" ? "added" : sort]: order },
            ...(limit && { take: limit + 1 }),
            cursor: cursor ? { id: cursor } : undefined,
          })
        ).map((product) => ({
          ...product,
          cart: user?.cart.find(({ productId }) => productId === product.id),
        }));

        let nextCursor: typeof cursor | undefined;

        if (products.length > limit) {
          const nextItem = products.pop();
          nextCursor = nextItem!.id; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- We know that products is not empty
        }

        return {
          products,
          nextCursor,
        };
      },
    ),
});
