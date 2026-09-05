-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'SOURCE_ATTACHED', 'FACT_CHECKED', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('VERIFIED', 'NEEDS_VERIFICATION', 'UNAVAILABLE', 'SOURCE_CONFLICT');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ClaimBasis" AS ENUM ('OFFICIALLY_STATED', 'DERIVED', 'ESTIMATED', 'USER_REPORTED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('GOVERNMENT_AGENCY', 'GOVERNMENT_PORTAL', 'GAZETTE_OR_LAW', 'LOCAL_GOVERNMENT', 'REPUTABLE_SECONDARY');

-- CreateEnum
CREATE TYPE "FeeKind" AS ENUM ('APPLICATION', 'SERVICE', 'EXPEDITED', 'LATE', 'DUPLICATE', 'RENEWAL', 'OTHER');

-- CreateEnum
CREATE TYPE "AppointmentRequirement" AS ENUM ('REQUIRED', 'OPTIONAL', 'NOT_REQUIRED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('FEE_CHANGED', 'DOCUMENTS_CHANGED', 'OFFICE_CHANGED', 'LINK_BROKEN', 'PROCESS_CHANGED', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('NEW', 'TRIAGED', 'ACCEPTED', 'REJECTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'EDITOR', 'CONTRIBUTOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "NoticeLevel" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'CONTRIBUTOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameNe" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionNe" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "life_events" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameNe" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "life_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_life_events" (
    "procedureId" TEXT NOT NULL,
    "lifeEventId" TEXT NOT NULL,

    CONSTRAINT "procedure_life_events_pkey" PRIMARY KEY ("procedureId","lifeEventId")
);

-- CreateTable
CREATE TABLE "procedures" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleNe" TEXT NOT NULL,
    "summaryEn" TEXT NOT NULL,
    "summaryNe" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionNe" TEXT,
    "eligibilityEn" TEXT,
    "eligibilityNe" TEXT,
    "notesEn" TEXT,
    "notesNe" TEXT,
    "categoryId" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NEEDS_VERIFICATION',
    "confidence" "ConfidenceLevel" NOT NULL DEFAULT 'LOW',
    "lastVerifiedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "appointmentRequirement" "AppointmentRequirement" NOT NULL DEFAULT 'UNKNOWN',
    "appointmentNoteEn" TEXT,
    "appointmentNoteNe" TEXT,
    "appointmentUrl" TEXT,
    "processingTimeEn" TEXT,
    "processingTimeNe" TEXT,
    "processingTimeBasis" "ClaimBasis" NOT NULL DEFAULT 'UNKNOWN',
    "whereToApplyEn" TEXT,
    "whereToApplyNe" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "metaTitleEn" TEXT,
    "metaTitleNe" TEXT,
    "metaDescriptionEn" TEXT,
    "metaDescriptionNe" TEXT,
    "searchText" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_aliases" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'translit',

    CONSTRAINT "procedure_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_steps" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleNe" TEXT NOT NULL,
    "detailEn" TEXT,
    "detailNe" TEXT,
    "actionUrl" TEXT,
    "basis" "ClaimBasis" NOT NULL DEFAULT 'OFFICIALLY_STATED',
    "sourceId" TEXT,

    CONSTRAINT "procedure_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "required_documents" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameNe" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionNe" TEXT,

    CONSTRAINT "required_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_documents" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "conditionEn" TEXT,
    "conditionNe" TEXT,
    "basis" "ClaimBasis" NOT NULL DEFAULT 'OFFICIALLY_STATED',
    "sourceId" TEXT,

    CONSTRAINT "procedure_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fees" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelNe" TEXT NOT NULL,
    "kind" "FeeKind" NOT NULL DEFAULT 'APPLICATION',
    "amountNpr" INTEGER,
    "amountTextEn" TEXT,
    "amountTextNe" TEXT,
    "basis" "ClaimBasis" NOT NULL DEFAULT 'UNKNOWN',
    "sourceId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offices" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameNe" TEXT NOT NULL,
    "organizationEn" TEXT NOT NULL,
    "organizationNe" TEXT NOT NULL,
    "addressEn" TEXT,
    "addressNe" TEXT,
    "district" TEXT,
    "province" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "mapUrl" TEXT,
    "sourceId" TEXT,

    CONSTRAINT "offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_hours" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "opensAt" TEXT,
    "closesAt" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "noteEn" TEXT,
    "noteNe" TEXT,

    CONSTRAINT "office_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_offices" (
    "procedureId" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "roleEn" TEXT,
    "roleNe" TEXT,

    CONSTRAINT "procedure_offices_pkey" PRIMARY KEY ("procedureId","officeId")
);

-- CreateTable
CREATE TABLE "official_sources" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT,
    "organization" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL DEFAULT 'GOVERNMENT_AGENCY',
    "publishedAt" TIMESTAMP(3),
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "lastHttpStatus" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "official_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_snapshots" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "excerpt" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "httpStatus" INTEGER,

    CONSTRAINT "source_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_records" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "sourceId" TEXT,
    "adminId" TEXT,
    "outcome" "VerificationStatus" NOT NULL,
    "notes" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextReviewAt" TIMESTAMP(3),

    CONSTRAINT "verification_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_versions" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "changeNote" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procedure_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT,
    "level" "NoticeLevel" NOT NULL DEFAULT 'INFO',
    "titleEn" TEXT NOT NULL,
    "titleNe" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "bodyNe" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT,
    "questionEn" TEXT NOT NULL,
    "questionNe" TEXT NOT NULL,
    "answerEn" TEXT NOT NULL,
    "answerNe" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "basis" "ClaimBasis" NOT NULL DEFAULT 'OFFICIALLY_STATED',
    "sourceUrl" TEXT,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "message" TEXT,
    "contactEmail" TEXT,
    "submitterHash" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'NEW',
    "handledById" TEXT,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locale" TEXT,
    "props" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsor_slots" (
    "id" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT,
    "targetUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),

    CONSTRAINT "sponsor_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "life_events_slug_key" ON "life_events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "procedures_slug_key" ON "procedures"("slug");

-- CreateIndex
CREATE INDEX "procedures_status_verificationStatus_idx" ON "procedures"("status", "verificationStatus");

-- CreateIndex
CREATE INDEX "procedures_categoryId_idx" ON "procedures"("categoryId");

-- CreateIndex
CREATE INDEX "procedures_nextReviewAt_idx" ON "procedures"("nextReviewAt");

-- CreateIndex
CREATE INDEX "procedure_aliases_alias_idx" ON "procedure_aliases"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_aliases_procedureId_alias_key" ON "procedure_aliases"("procedureId", "alias");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_steps_procedureId_order_key" ON "procedure_steps"("procedureId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "required_documents_slug_key" ON "required_documents"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_documents_procedureId_documentId_key" ON "procedure_documents"("procedureId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "offices_slug_key" ON "offices"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "office_hours_officeId_dayOfWeek_key" ON "office_hours"("officeId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "official_sources_procedureId_idx" ON "official_sources"("procedureId");

-- CreateIndex
CREATE INDEX "official_sources_url_idx" ON "official_sources"("url");

-- CreateIndex
CREATE INDEX "source_snapshots_sourceId_capturedAt_idx" ON "source_snapshots"("sourceId", "capturedAt");

-- CreateIndex
CREATE INDEX "verification_records_procedureId_verifiedAt_idx" ON "verification_records"("procedureId", "verifiedAt");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_versions_procedureId_version_key" ON "procedure_versions"("procedureId", "version");

-- CreateIndex
CREATE INDEX "notices_procedureId_startsAt_idx" ON "notices"("procedureId", "startsAt");

-- CreateIndex
CREATE INDEX "faqs_procedureId_order_idx" ON "faqs"("procedureId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "translations_key_locale_key" ON "translations"("key", "locale");

-- CreateIndex
CREATE INDEX "reports_status_createdAt_idx" ON "reports"("status", "createdAt");

-- CreateIndex
CREATE INDEX "reports_procedureId_idx" ON "reports"("procedureId");

-- CreateIndex
CREATE INDEX "analytics_events_name_createdAt_idx" ON "analytics_events"("name", "createdAt");

-- CreateIndex
CREATE INDEX "sponsor_slots_placement_isActive_idx" ON "sponsor_slots"("placement", "isActive");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_life_events" ADD CONSTRAINT "procedure_life_events_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_life_events" ADD CONSTRAINT "procedure_life_events_lifeEventId_fkey" FOREIGN KEY ("lifeEventId") REFERENCES "life_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_aliases" ADD CONSTRAINT "procedure_aliases_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_steps" ADD CONSTRAINT "procedure_steps_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_steps" ADD CONSTRAINT "procedure_steps_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "official_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_documents" ADD CONSTRAINT "procedure_documents_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_documents" ADD CONSTRAINT "procedure_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "required_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_documents" ADD CONSTRAINT "procedure_documents_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "official_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "official_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offices" ADD CONSTRAINT "offices_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "official_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_hours" ADD CONSTRAINT "office_hours_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_offices" ADD CONSTRAINT "procedure_offices_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_offices" ADD CONSTRAINT "procedure_offices_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "official_sources" ADD CONSTRAINT "official_sources_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_snapshots" ADD CONSTRAINT "source_snapshots_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "official_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_records" ADD CONSTRAINT "verification_records_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_records" ADD CONSTRAINT "verification_records_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "official_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_records" ADD CONSTRAINT "verification_records_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_versions" ADD CONSTRAINT "procedure_versions_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_versions" ADD CONSTRAINT "procedure_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
