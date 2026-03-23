// Database client - will be initialized once DATABASE_URL is configured
// Run `npx prisma generate` after setting up your database

// Placeholder export for type safety
export const db = null;

// Uncomment below once database is configured:
// import { PrismaClient } from "@prisma/client";
//
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };
//
// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
//   });
//
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
