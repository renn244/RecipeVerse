-- CreateTable
CREATE TABLE "childComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "likes" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "childComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "childComment" ADD CONSTRAINT "childComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "childComment" ADD CONSTRAINT "childComment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
