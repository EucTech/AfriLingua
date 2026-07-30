-- CreateEnum
CREATE TYPE "MatchQueueStatus" AS ENUM ('waiting', 'matched', 'cancelled');

-- CreateTable
CREATE TABLE "match_queue_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "CallMode" NOT NULL,
    "language" TEXT NOT NULL,
    "status" "MatchQueueStatus" NOT NULL DEFAULT 'waiting',
    "callSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_queue_entries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "match_queue_entries" ADD CONSTRAINT "match_queue_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
