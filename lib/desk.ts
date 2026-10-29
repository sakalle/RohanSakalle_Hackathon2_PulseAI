import { prisma, ready } from "./db";

export async function getFeed(category: string, floor: number) {
  await ready();
  const where = {
    impactScore: { gte: floor },
    ...(category !== "all" ? { category } : {}),
  };
  const [items, sources, total] = await Promise.all([
    prisma.item.findMany({
      where,
      include: { source: true },
      orderBy: { fetchedAt: "desc" },
      take: 60,
    }),
    prisma.source.findMany({ orderBy: { name: "asc" } }),
    prisma.item.count(),
  ]);
  return { items, sources, total };
}

export async function getSubscribers() {
  await ready();
  return prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAlerts() {
  await ready();
  return prisma.alert.findMany({
    include: { item: { include: { source: true } }, subscriber: true },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
}
