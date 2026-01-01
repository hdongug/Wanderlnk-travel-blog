import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  posts,
  InsertPost,
  postImages,
  InsertPostImage,
  visitedPlaces,
  InsertVisitedPlace,
  newsletterSubscriptions,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Posts queries
// ============================================

export async function getAllPosts(filters?: {
  destination?: string;
  travelType?: string;
  published?: "draft" | "published";
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(posts).$dynamic();

  if (filters?.published) {
    query = query.where(eq(posts.published, filters.published));
  }
  if (filters?.destination) {
    query = query.where(eq(posts.destination, filters.destination));
  }
  if (filters?.travelType) {
    query = query.where(eq(posts.travelType, filters.travelType));
  }

  return await query.orderBy(posts.createdAt);
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPost(post: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(posts).values(post);
}

export async function updatePost(id: number, post: Partial<InsertPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(posts).set(post).where(eq(posts.id, id));
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(posts).where(eq(posts.id, id));
}

export async function getDestinations() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .selectDistinct({ destination: posts.destination })
    .from(posts)
    .where(eq(posts.published, "published"));

  return result.map((r) => r.destination);
}

export async function getTravelTypes() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .selectDistinct({ travelType: posts.travelType })
    .from(posts)
    .where(eq(posts.published, "published"));

  return result.map((r) => r.travelType).filter((t): t is string => t !== null);
}

// ============================================
// Post Images queries
// ============================================

export async function getPostImages(postId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(postImages)
    .where(eq(postImages.postId, postId))
    .orderBy(postImages.displayOrder);
}

export async function createPostImage(image: InsertPostImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(postImages).values(image);
}

export async function deletePostImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(postImages).where(eq(postImages.id, id));
}

// ============================================
// Visited Places queries
// ============================================

export async function getAllVisitedPlaces() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(visitedPlaces).orderBy(visitedPlaces.visitDate);
}

export async function getVisitedPlaceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(visitedPlaces).where(eq(visitedPlaces.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createVisitedPlace(place: InsertVisitedPlace) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(visitedPlaces).values(place);
}

export async function updateVisitedPlace(id: number, place: Partial<InsertVisitedPlace>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(visitedPlaces).set(place).where(eq(visitedPlaces.id, id));
}

export async function deleteVisitedPlace(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(visitedPlaces).where(eq(visitedPlaces.id, id));
}

// ============================================
// Newsletter Subscriptions queries
// ============================================

export async function subscribeNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(newsletterSubscriptions).values({
      email,
      status: "active",
    });
  } catch (error) {
    // Handle duplicate email
    throw new Error("Email already subscribed");
  }
}

export async function unsubscribeNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(newsletterSubscriptions)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(newsletterSubscriptions.email, email));
}

export async function getAllNewsletterSubscriptions() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(newsletterSubscriptions).orderBy(newsletterSubscriptions.subscribedAt);
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).orderBy(users.createdAt);
}
