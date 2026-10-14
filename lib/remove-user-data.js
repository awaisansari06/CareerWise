/** Called only after a verified Clerk user.deleted webhook. Deletion is idempotent. */
export async function removeUserData(db, clerkUserId) {
  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({where:{clerkUserId},select:{id:true}});
    if (!user) return;
    const where = {userId:user.id};
    await tx.assessment.deleteMany({where});
    await tx.coverLetter.deleteMany({where});
    await tx.resumeAnalysis.deleteMany({where});
    await tx.roadmap.deleteMany({where});
    await tx.resume.deleteMany({where});
    await tx.aiUsage.deleteMany({where:{id:{startsWith:`${user.id}:`}}});
    await tx.user.deleteMany({where:{id:user.id,clerkUserId}});
  });
}
