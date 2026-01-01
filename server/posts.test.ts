import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("posts router", () => {
  it("should allow public access to list published posts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.posts.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow filtering posts by destination", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.posts.list({ destination: "Seoul" });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow filtering posts by travel type", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.posts.list({ travelType: "Adventure" });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get destinations list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.posts.getDestinations();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get travel types list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.posts.getTravelTypes();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow admin to list all posts", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.posts.listAll();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should reject non-admin from listing all posts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.posts.listAll()).rejects.toThrow();
  });
});
