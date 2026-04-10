import { prisma } from "@/lib/prisma";

export async function dbFindProfileByEmail(email: string) {
  return await prisma.profile.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  });
}
