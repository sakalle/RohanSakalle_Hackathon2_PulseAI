"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, ready } from "@/lib/db";
import { pollAll } from "@/lib/ingest";
import { validatePrefs } from "@/lib/prefs.mjs";

export async function pollNow(_previous: Awaited<ReturnType<typeof pollAll>> | null) {
  const result = await pollAll();
  revalidatePath("/");
  revalidatePath("/inbox");
  return result;
}

export async function saveSubscriber(formData: FormData) {
  const parsed = validatePrefs({
    email: formData.get("email"),
    providers: formData.getAll("providers"),
    frequency: formData.get("frequency"),
    paused: formData.get("paused") === "on",
    minImpact: formData.get("minImpact"),
  });
  if (!parsed.ok || !parsed.value) {
    redirect(`/preferences?error=${encodeURIComponent(parsed.cause || "Could not save that preference.")}`);
  }

  await ready();
  const value = parsed.value;
  await prisma.subscriber.upsert({
    where: { email: value.email },
    update: {
      providers: JSON.stringify(value.providers),
      frequency: value.frequency,
      paused: value.paused,
      minImpact: value.minImpact,
    },
    create: {
      email: value.email,
      providers: JSON.stringify(value.providers),
      frequency: value.frequency,
      paused: value.paused,
      minImpact: value.minImpact,
    },
  });
  redirect("/preferences?saved=1");
}
