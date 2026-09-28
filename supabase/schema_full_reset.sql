-- ==============================================================================
-- WEXLOGIC CRM — Complete Clean-Slate Database Schema Reset
-- Target: Supabase / PostgreSQL
-- Description: Safely drops all legacy tables, types, and functions with CASCADE,
--              then creates all 19 production CRM tables with strict foreign keys,
--              decimal-accurate financial math, performance indexes, RLS, and seed data.
-- ==============================================================================

-- ==============================================================================
-- STEP 1: DROP OLD / LEGACY TABLES, TYPES & FUNCTIONS (CLEAN SLATE)
-- ==============================================================================

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.client_payments CASCADE;
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.vendor_bills CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.project_subcategories CASCADE;
DROP TABLE IF EXISTS public.project_categories CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.deals CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.revenue CASCADE; -- Legacy table
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.revenue_status CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- STEP 2: CREATE ALL PRODUCTION TABLES
-- ==============================================================================

-- 1. USER ROLES (Role-Based Access Control)
CREATE TABLE public.user_roles (
  id TEXT PRIMARY KEY, -- Clerk User ID (e.g. 'user_2xyz...') or UUID
  full_name TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'manager', 'sales', 'employee', 'viewer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. COMPANIES (B2B Client Organizations & Accounts)
CREATE TABLE public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  gst_number TEXT,
  owner_id TEXT, -- Clerk user ID
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'prospect', 'archived'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLIENTS (Individual Client Contacts & Accounts)
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT,
  alternate_phone TEXT,
  designation TEXT,
  website TEXT,
  industry TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  gst_number TEXT,
  source TEXT,
  account_owner_id TEXT, -- Clerk user ID
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'prospect', 'archived'
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_by TEXT, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SERVICES (Standard Product & Service Catalog)
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  base_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LEADS (Sales Inquiries & Pre-qualification Funnel)
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_code TEXT UNIQUE,
  full_name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  alternate_phone TEXT,
  designation TEXT,
  website TEXT,
  industry TEXT,
  location TEXT,
  source TEXT DEFAULT 'Website', -- 'Website', 'Instagram', 'Referral', etc.
  owner_id TEXT, -- Clerk user ID
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'
  lead_value NUMERIC(12, 2) DEFAULT 0,
  expected_close_date DATE,
  next_follow_up TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  converted_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  created_by TEXT, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DEALS (Sales Opportunities Kanban Pipeline)
CREATE TABLE public.deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_name TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  estimated_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'new', -- 'new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'
  probability INT DEFAULT 20, -- 0 to 100%
  expected_close_date DATE,
  owner_id TEXT, -- Clerk user ID
  source TEXT,
  notes TEXT,
  created_by TEXT, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PROJECTS (Core Business Engagements & Contracts)
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_code TEXT UNIQUE,
  name TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  description TEXT,
  project_value NUMERIC(12, 2) NOT NULL DEFAULT 0, -- Contract amount client pays WexLogic
  overall_budget NUMERIC(12, 2) NOT NULL DEFAULT 0, -- Total internal budget allocated for delivery
  start_date DATE,
  end_date DATE,
  project_manager_id TEXT, -- Clerk user ID
  status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'active', 'on_hold', 'completed', 'cancelled'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  notes TEXT,
  quotation_number TEXT,
  quotation_date DATE,
  quotation_expiry_date DATE,
  quotation_pdf_url TEXT,
  quotation_data JSONB,
  created_by TEXT, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PROJECT CATEGORIES (Internal Work & Expense Cost Buckets)
CREATE TABLE public.project_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. 'Meta Ads', 'Decoration', 'Modeling', 'Photography', 'Video Production'
  budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. PROJECT SUB-CATEGORIES (Optional Granular Cost Allocations)
CREATE TABLE public.project_subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.project_categories(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. VENDORS (External Suppliers, Contractors & Freelancers)
CREATE TABLE public.vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,
  email TEXT,
  category TEXT, -- 'Decoration', 'Production', 'Catering', 'Freelancer', etc.
  address TEXT,
  city TEXT,
  gst_number TEXT,
  bank_details JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
  notes TEXT,
  created_by TEXT, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. EXPENSES (Actual Outflow Costs Incurred Against Categories)
CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.project_categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.project_subcategories(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_status TEXT NOT NULL DEFAULT 'paid', -- 'pending', 'partially_paid', 'paid', 'cancelled'
  payment_method TEXT DEFAULT 'bank_transfer', -- 'upi', 'bank_transfer', 'cash', 'card', 'cheque', 'other'
  bill_number TEXT,
  receipt_ref TEXT,
  notes TEXT,
  created_by TEXT, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. VENDOR BILLS (Accounts Payable & Vendor Invoices)
CREATE TABLE public.vendor_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.project_categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.project_subcategories(id) ON DELETE SET NULL,
  bill_number TEXT NOT NULL,
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(12, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled'
  attachment_url TEXT,
  notes TEXT,
  created_by TEXT, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. INVOICES (Client Billing & Accounts Receivable)
CREATE TABLE public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(12, 2) DEFAULT 0,
  discount NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'
  notes TEXT,
  attachment_url TEXT,
  pdf_url TEXT,
  quotation_number TEXT,
  created_by TEXT, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. INVOICE ITEMS (Detailed Line Items on Invoices)
CREATE TABLE public.invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- 15. CLIENT PAYMENTS (Collected Cash Revenue - The Golden Separation)
CREATE TABLE public.client_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_number TEXT UNIQUE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer', -- 'upi', 'bank_transfer', 'cash', 'card', 'cheque', 'other'
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'pending', 'failed'
  notes TEXT,
  attachment_url TEXT,
  recorded_by TEXT, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. TASKS (Operational Action Items & Category Deliverables)
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.project_categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.project_subcategories(id) ON DELETE SET NULL,
  assigned_to TEXT, -- Clerk user ID
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'completed', 'cancelled'
  start_date DATE,
  due_date DATE,
  description TEXT,
  estimated_cost NUMERIC(12, 2) DEFAULT 0,
  actual_cost NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  created_by TEXT, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. ACTIVITIES (Interaction Timeline & Client Touchpoints)
CREATE TABLE public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  type TEXT NOT NULL DEFAULT 'note', -- 'call', 'meeting', 'email', 'whatsapp', 'note', 'follow_up', 'other'
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. DOCUMENTS (Uploaded Attachments & Agreements)
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INT,
  entity_type TEXT NOT NULL, -- 'lead', 'client', 'company', 'deal', 'project', 'invoice', 'vendor_bill'
  entity_id UUID NOT NULL,
  uploaded_by TEXT, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. AUDIT LOGS (Immutable Compliance & System Action Trail)
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT, -- Clerk user ID
  user_email TEXT,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'convert', 'login', 'export'
  entity TEXT NOT NULL, -- 'lead', 'client', 'project', 'invoice', 'payment', 'expense', 'budget', 'user'
  record_id TEXT,
  previous_state JSONB,
  new_state JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. NOTIFICATIONS (User & Role Alerts)
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'alert', 'success'
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- STEP 3: PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX idx_companies_status ON public.companies(status);
CREATE INDEX idx_clients_company ON public.clients(company_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_deals_client ON public.deals(client_id);
CREATE INDEX idx_projects_client ON public.projects(client_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_proj_cat_project ON public.project_categories(project_id);
CREATE INDEX idx_proj_subcat_cat ON public.project_subcategories(category_id);
CREATE INDEX idx_expenses_project ON public.expenses(project_id);
CREATE INDEX idx_expenses_category ON public.expenses(category_id);
CREATE INDEX idx_expenses_vendor ON public.expenses(vendor_id);
CREATE INDEX idx_vendor_bills_vendor ON public.vendor_bills(vendor_id);
CREATE INDEX idx_vendor_bills_project ON public.vendor_bills(project_id);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_project ON public.invoices(project_id);
CREATE INDEX idx_projects_quotation_number ON public.projects(quotation_number);
CREATE INDEX idx_invoices_quotation_number ON public.invoices(quotation_number);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX idx_payments_client ON public.client_payments(client_id);
CREATE INDEX idx_payments_project ON public.client_payments(project_id);
CREATE INDEX idx_payments_invoice ON public.client_payments(invoice_id);
CREATE INDEX idx_tasks_project ON public.tasks(project_id);
CREATE INDEX idx_tasks_category ON public.tasks(category_id);
CREATE INDEX idx_activities_client ON public.activities(client_id);
CREATE INDEX idx_activities_project ON public.activities(project_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ==============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Permissive policies allowing authenticated CRM requests & service role
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'user_roles', 'companies', 'clients', 'services', 'leads', 'deals',
    'projects', 'project_categories', 'project_subcategories', 'vendors',
    'expenses', 'vendor_bills', 'invoices', 'invoice_items', 'client_payments',
    'tasks', 'activities', 'documents', 'audit_logs', 'notifications'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "crm_authenticated_access" ON public.%I', tbl);
    EXECUTE format('CREATE POLICY "crm_authenticated_access" ON public.%I FOR ALL TO authenticated, anon USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;

-- ==============================================================================
-- STEP 5: SEED INITIAL ESSENTIAL SERVICES
-- ==============================================================================

INSERT INTO public.services (name, category, description, base_price, is_active)
VALUES
  ('Meta Ads', 'Digital Marketing', 'Paid social performance advertising & retargeting', 100000.00, TRUE),
  ('Decoration & Production', 'Event Production', 'Stage design, venue decoration & lighting setup', 100000.00, TRUE),
  ('Modeling & Talent Management', 'Talent', 'Brand ambassadors, runway models & styling coordination', 60000.00, TRUE),
  ('Photography', 'Creative', 'Event coverage & high-resolution media deliverables', 40000.00, TRUE),
  ('Video Production', 'Creative', 'Teasers, recap films & live cinematography coverage', 70000.00, TRUE)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- STEP 6: SUPABASE STORAGE BUCKETS & POLICIES (QUOTATIONS, INVOICES, DOCUMENTS)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('quotations', 'quotations', true, 10485760, ARRAY['application/pdf']),
  ('invoices', 'invoices', true, 10485760, ARRAY['application/pdf']),
  ('documents', 'documents', true, 20971520, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Quotations (RLS is already pre-enabled by Supabase on storage.objects)
DROP POLICY IF EXISTS "Public read access on quotations" ON storage.objects;
CREATE POLICY "Public read access on quotations" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'quotations');
DROP POLICY IF EXISTS "Allow upload to quotations" ON storage.objects;
CREATE POLICY "Allow upload to quotations" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'quotations');
DROP POLICY IF EXISTS "Allow update on quotations" ON storage.objects;
CREATE POLICY "Allow update on quotations" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'quotations');
DROP POLICY IF EXISTS "Allow delete on quotations" ON storage.objects;
CREATE POLICY "Allow delete on quotations" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'quotations');

-- Invoices
DROP POLICY IF EXISTS "Public read access on invoices" ON storage.objects;
CREATE POLICY "Public read access on invoices" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'invoices');
DROP POLICY IF EXISTS "Allow upload to invoices" ON storage.objects;
CREATE POLICY "Allow upload to invoices" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'invoices');
DROP POLICY IF EXISTS "Allow update on invoices" ON storage.objects;
CREATE POLICY "Allow update on invoices" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'invoices');
DROP POLICY IF EXISTS "Allow delete on invoices" ON storage.objects;
CREATE POLICY "Allow delete on invoices" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'invoices');

-- Documents
DROP POLICY IF EXISTS "Public read access on documents" ON storage.objects;
CREATE POLICY "Public read access on documents" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'documents');
DROP POLICY IF EXISTS "Allow upload to documents" ON storage.objects;
CREATE POLICY "Allow upload to documents" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'documents');
DROP POLICY IF EXISTS "Allow update on documents" ON storage.objects;
CREATE POLICY "Allow update on documents" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'documents');
DROP POLICY IF EXISTS "Allow delete on documents" ON storage.objects;
CREATE POLICY "Allow delete on documents" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'documents');
