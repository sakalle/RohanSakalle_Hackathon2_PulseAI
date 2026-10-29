import { PrismaClient } from "@prisma/client";
import { SOURCES } from "./catalog.mjs";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

let readyPromise: Promise<void> | null = null;

export function ready() {
  readyPromise ??= seed();
  return readyPromise;
}

async function seed() {
  for (const source of SOURCES) {
    await prisma.source.upsert({
      where: { id: source.id },
      update: {},
      create: {
        id: source.id,
        name: source.name,
        kind: source.kind,
        url: source.url,
        weight: source.weight,
        enabled: true,
      },
    });
  }
  await prisma.setting.upsert({
    where: { key: "defaultMinImpact" },
    update: {},
    create: { key: "defaultMinImpact", value: "70" },
  });
}
