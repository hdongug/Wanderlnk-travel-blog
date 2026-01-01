import { COOKIE_NAME } from "@shared/const";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  posts: router({
    list: publicProcedure
      .input(
        z
          .object({
            destination: z.string().optional(),
            travelType: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return await db.getAllPosts({
          ...input,
          published: "published",
        });
      }),
    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return await db.getPostBySlug(input.slug);
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getPostById(input.id);
    }),
    getDestinations: publicProcedure.query(async () => {
      return await db.getDestinations();
    }),
    getTravelTypes: publicProcedure.query(async () => {
      return await db.getTravelTypes();
    }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          slug: z.string(),
          excerpt: z.string().optional(),
          content: z.string(),
          coverImage: z.string().optional(),
          destination: z.string(),
          travelType: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          published: z.enum(["draft", "published"]).default("draft"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.createPost({ ...input, authorId: ctx.user.id });
        return { success: true };
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          slug: z.string().optional(),
          excerpt: z.string().optional(),
          content: z.string().optional(),
          coverImage: z.string().optional(),
          destination: z.string().optional(),
          travelType: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          published: z.enum(["draft", "published"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...data } = input;
        await db.updatePost(id, data);
        return { success: true };
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.deletePost(input.id);
      return { success: true };
    }),
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.getAllPosts();
    }),
  }),

  postImages: router({
    getByPostId: publicProcedure.input(z.object({ postId: z.number() })).query(async ({ input }) => {
      return await db.getPostImages(input.postId);
    }),
    create: protectedProcedure
      .input(
        z.object({
          postId: z.number(),
          imageUrl: z.string(),
          caption: z.string().optional(),
          displayOrder: z.number().default(0),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.createPostImage(input);
        return { success: true };
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.deletePostImage(input.id);
      return { success: true };
    }),
  }),

  visitedPlaces: router({
    list: publicProcedure.query(async () => {
      return await db.getAllVisitedPlaces();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getVisitedPlaceById(input.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          country: z.string(),
          latitude: z.string(),
          longitude: z.string(),
          description: z.string().optional(),
          visitDate: z.date().optional(),
          imageUrl: z.string().optional(),
          postId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.createVisitedPlace(input);
        return { success: true };
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          country: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          description: z.string().optional(),
          visitDate: z.date().optional(),
          imageUrl: z.string().optional(),
          postId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...data } = input;
        await db.updateVisitedPlace(id, data);
        return { success: true };
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.deleteVisitedPlace(input.id);
      return { success: true };
    }),
  }),

  newsletter: router({
    subscribe: publicProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ input }) => {
      try {
        await db.subscribeNewsletter(input.email);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to subscribe",
        });
      }
    }),
    unsubscribe: publicProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ input }) => {
      await db.unsubscribeNewsletter(input.email);
      return { success: true };
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.getAllNewsletterSubscriptions();
    }),
  }),

  users: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.getAllUsers();
    }),
  }),

  upload: router({
    image: protectedProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Convert base64 to buffer
        const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        // Generate unique filename
        const ext = input.filename.split(".").pop() || "jpg";
        const uniqueFilename = `${nanoid()}.${ext}`;
        const fileKey = `images/${uniqueFilename}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return { url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
