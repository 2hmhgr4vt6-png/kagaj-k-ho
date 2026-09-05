-- DropIndex
DROP INDEX "procedure_aliases_alias_idx";

-- CreateIndex
CREATE INDEX "procedure_aliases_alias_idx" ON "procedure_aliases" USING GIN ("alias" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "procedures_searchText_idx" ON "procedures" USING GIN ("searchText" gin_trgm_ops);
