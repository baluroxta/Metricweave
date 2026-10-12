import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import { cache } from "react";

let prismaInstance: PrismaClient | null = null;

export const getPrisma = cache((): PrismaClient => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not configured. Please set DATABASE_URL in your environment to enable Prisma database persistence."
    );
  }
  if (!prismaInstance) {
    const neon = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(neon);
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
});
