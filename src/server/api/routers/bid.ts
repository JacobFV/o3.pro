import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { bids } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * This Bid Router:
 * 1. getMax: returns the largest bid amount so far.
 * 2. create: inserts a new bid; if "usage" is provided, also creates a post.
 */
export const bidRouter = createTRPCRouter({
  getMax: publicProcedure.query(async ({ ctx }) => {
    const maxBidRow = await ctx.db.query.bids.findFirst({
      orderBy: (table, { desc }) => [desc(table.amount)],
    });
    return maxBidRow?.amount ?? 0;
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        usage: z.string().optional(),
        bidOption: z.string().optional(),
        customBid: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find the current max bid
      const currentMax = await ctx.db.query.bids.findFirst({
        orderBy: (table, { desc }) => [desc(table.amount)],
      });
      const base = currentMax?.amount ?? 0;

      // Compute the new bid based on user selection
      let newAmount = base;
      if (input.bidOption === "5%") {
        newAmount = base * 1.05;
      } else if (input.bidOption === "10%") {
        newAmount = base * 1.1;
      } else if (input.bidOption === "custom" && input.customBid) {
        newAmount = parseFloat(input.customBid);
      }

      // Insert a new bid
      await ctx.db.insert(bids).values({
        name: input.name,
        email: input.email,
        usage: input.usage ?? null,
        amount: newAmount,
      });
    }),

  // New procedure to update usage only
  updateUsage: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        usage: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(bids)
        .set({ usage: input.usage })
        .where(eq(bids.email, input.email));
    }),
});
