-- ==============================================================================
-- WEXLOGIC CRM — Migration 003: Quotations, Invoices PDF & Supabase Storage
-- Target: Supabase / PostgreSQL
-- Description:
--   1. Adds quotation columns (number, dates, PDF URL, JSONB state) to 'projects'
--   2. Adds PDF URL and quotation reference to 'invoices'
--   3. Creates Supabase Storage buckets ('quotations', 'invoices', 'documents')
--   4. Configures Row Level Security (RLS) on storage.objects for public read & authenticated write
-- ==============================================================================

-- 1. EXTEND PROJECTS TABLE WITH QUOTATION & PDF FIELDS
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS quotation_number TEXT,
  ADD COLUMN IF NOT EXISTS quotation_date DATE,
  ADD COLUMN IF NOT EXISTS quotation_expiry_date DATE,
  ADD COLUMN IF NOT EXISTS quotation_pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS quotation_data JSONB;

-- 2. EXTEND INVOICES TABLE WITH PDF STORAGE & QUOTATION REFERENCE
ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS quotation_number TEXT;

-- 3. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_projects_quotation_number ON public.projects(quotation_number);
CREATE INDEX IF NOT EXISTS idx_invoices_quotation_number ON public.invoices(quotation_number);

-- 4. CONFIGURE SUPABASE STORAGE BUCKETS
-- Insert public buckets for PDF documents and project media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('quotations', 'quotations', true, 10485760, ARRAY['application/pdf']),
  ('invoices', 'invoices', true, 10485760, ARRAY['application/pdf']),
  ('documents', 'documents', true, 20971520, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 5. STORAGE RLS POLICIES FOR STORAGE.OBJECTS (RLS is already pre-enabled by Supabase)
-- Quotations Bucket Policies (Public read, Anon & Authenticated upload/modify)
DROP POLICY IF EXISTS "Public read access on quotations" ON storage.objects;
CREATE POLICY "Public read access on quotations" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'quotations');

DROP POLICY IF EXISTS "Allow upload to quotations" ON storage.objects;
CREATE POLICY "Allow upload to quotations" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'quotations');

DROP POLICY IF EXISTS "Allow update on quotations" ON storage.objects;
CREATE POLICY "Allow update on quotations" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'quotations');

DROP POLICY IF EXISTS "Allow delete on quotations" ON storage.objects;
CREATE POLICY "Allow delete on quotations" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'quotations');

-- Invoices Bucket Policies
DROP POLICY IF EXISTS "Public read access on invoices" ON storage.objects;
CREATE POLICY "Public read access on invoices" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'invoices');

DROP POLICY IF EXISTS "Allow upload to invoices" ON storage.objects;
CREATE POLICY "Allow upload to invoices" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'invoices');

DROP POLICY IF EXISTS "Allow update on invoices" ON storage.objects;
CREATE POLICY "Allow update on invoices" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'invoices');

DROP POLICY IF EXISTS "Allow delete on invoices" ON storage.objects;
CREATE POLICY "Allow delete on invoices" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'invoices');

-- Documents Bucket Policies
DROP POLICY IF EXISTS "Public read access on documents" ON storage.objects;
CREATE POLICY "Public read access on documents" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow upload to documents" ON storage.objects;
CREATE POLICY "Allow upload to documents" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow update on documents" ON storage.objects;
CREATE POLICY "Allow update on documents" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow delete on documents" ON storage.objects;
CREATE POLICY "Allow delete on documents" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'documents');
