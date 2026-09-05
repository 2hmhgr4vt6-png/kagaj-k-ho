-- CreateEnum
CREATE TYPE "SourceCheckOutcome" AS ENUM ('OK', 'THIN_CONTENT', 'HTTP_ERROR', 'UNREACHABLE');

-- AlterTable
ALTER TABLE "official_sources" ADD COLUMN     "lastCheckOutcome" "SourceCheckOutcome",
ADD COLUMN     "lastCheckedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "source_snapshots" ADD COLUMN     "extractedVia" TEXT,
ADD COLUMN     "mainTextLength" INTEGER;
