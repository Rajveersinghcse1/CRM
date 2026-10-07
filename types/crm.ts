// ==============================================================================
// WEXLOGIC CRM — TypeScript Core Types & Business Interfaces
// ==============================================================================

import type { CrmRole } from "@/utils/auth";

// --- ENUMS & STATUSES ---

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type DealStage =
  | "new"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type ProjectStatus =
  | "planned"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export type PaymentStatus = "pending" | "partially_paid" | "paid" | "cancelled";

export type BillStatus = "pending" | "partially_paid" | "paid" | "overdue" | "cancelled";

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type PaymentMethod =
  | "upi"
  | "bank_transfer"
  | "cash"
  | "card"
  | "cheque"
  | "other";

export type TaskStatus = "todo" | "in_progress" | "completed" | "cancelled";

export type ActivityType =
  | "call"
  | "meeting"
  | "email"
  | "whatsapp"
  | "note"
  | "follow_up"
  | "other";

// --- CORE ENTITY INTERFACES ---

export interface Company {
  id: string;
  name: string;
  website?: string | null;
  industry?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  gst_number?: string | null;
  owner_id?: string | null;
  status: "active" | "inactive" | "prospect" | "archived";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  company_name: string;
  company_id?: string | null;
  company?: Company | null;
  email: string;
  phone?: string | null;
  alternate_phone?: string | null;
  designation?: string | null;
  website?: string | null;
  industry?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  gst_number?: string | null;
  source?: string | null;
  account_owner_id?: string | null;
  status: "active" | "inactive" | "prospect" | "archived";
  tags?: string[];
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  creator?: { full_name?: string } | null;
}

export interface Service {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  base_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  lead_code?: string | null;
  full_name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  alternate_phone?: string | null;
  designation?: string | null;
  website?: string | null;
  industry?: string | null;
  location?: string | null;
  source: string;
  owner_id?: string | null;
  status: LeadStatus;
  lead_value: number;
  expected_close_date?: string | null;
  next_follow_up?: string | null;
  tags?: string[];
  notes?: string | null;
  converted_client_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  deal_name: string;
  client_id: string;
  client?: Client | null;
  company_id?: string | null;
  company?: Company | null;
  service_id?: string | null;
  service?: Service | null;
  estimated_value: number;
  stage: DealStage;
  probability: number;
  expected_close_date?: string | null;
  owner_id?: string | null;
  source?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  project_code?: string | null;
  name: string;
  client_id: string;
  client?: Client | null;
  company_id?: string | null;
  company?: Company | null;
  description?: string | null;
  project_value: number; // Contract value client pays WexLogic
  overall_budget: number; // Internal cost cap
  start_date?: string | null;
  end_date?: string | null;
  project_manager_id?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  notes?: string | null;
  quotation_number?: string | null;
  quotation_date?: string | null;
  quotation_expiry_date?: string | null;
  quotation_pdf_url?: string | null;
  quotation_data?: any | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;

  // Computed / Joined fields (Aligned with todo.md Agency Financial Model)
  categories?: ProjectCategory[];
  totalCollected?: number;
  totalOutstanding?: number; // legacy alias for clientPending
  clientPending?: number; // Contract Value - Total Client Payments
  totalActualCost?: number; // Total Project Expenses
  availableBalance?: number; // Total Collected - Total Expenses
  budgetLeft?: number; // legacy alias for availableBalance
  remainingBudget?: number;
  grossProfit?: number; // Expected Final Profit (Contract Value - Total Expenses)
  grossMargin?: number;
  expectedProfit?: number;
  expectedMargin?: number;
}

export interface ProjectCategory {
  id: string;
  project_id: string;
  name: string; // e.g. Meta Ads, Decoration, Modeling, Photography, Video Production
  budget: number;
  sort_order: number;
  created_at: string;
  updated_at: string;

  // Aggregated
  actual_cost?: number;
  remaining_budget?: number;
  utilization_pct?: number;
  subcategories?: ProjectSubcategory[];
}

export interface ProjectSubcategory {
  id: string;
  category_id: string;
  project_id: string;
  name: string; // e.g. Ad Spend, Creative, Material, Vendor, Model Fee
  budget: number;
  actual_cost?: number;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  company_name?: string | null;
  phone?: string | null;
  email?: string | null;
  category?: string | null;
  address?: string | null;
  city?: string | null;
  gst_number?: string | null;
  bank_details?: Record<string, string>;
  status: "active" | "inactive";
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;

  // Computed
  total_bills?: number;
  total_paid?: number;
  total_pending?: number;
}

export interface Expense {
  id: string;
  project_id: string;
  project?: { name: string } | null;
  client_id?: string | null;
  client?: Client | { name: string; company_name?: string | null } | null;
  category_id?: string | null;
  category?: { name: string } | null;
  subcategory_id?: string | null;
  subcategory?: { name: string } | null;
  vendor_id?: string | null;
  vendor?: Vendor | { name: string; company_name?: string | null } | null;
  description: string;
  amount: number;
  expense_date: string;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod | null;
  bill_number?: string | null;
  receipt_ref?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorBill {
  id: string;
  vendor_id: string;
  vendor?: Vendor | null;
  project_id?: string | null;
  project?: { name: string } | null;
  category_id?: string | null;
  category?: { name: string } | null;
  subcategory_id?: string | null;
  subcategory?: { name: string } | null;
  bill_number: string;
  bill_date: string;
  due_date?: string | null;
  amount: number;
  tax: number;
  total_amount: number;
  payment_status: BillStatus;
  attachment_url?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client?: Client | null;
  project_id?: string | null;
  project?: { name: string } | null;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amount_paid: number;
  status: InvoiceStatus;
  notes?: string | null;
  attachment_url?: string | null;
  pdf_url?: string | null;
  quotation_number?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface ClientPayment {
  id: string;
  payment_number?: string | null;
  client_id: string;
  client?: Client | null;
  project_id?: string | null;
  project?: { name: string } | null;
  invoice_id?: string | null;
  invoice?: { invoice_number: string } | null;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number?: string | null;
  status: "completed" | "pending" | "failed" | "cancelled";
  notes?: string | null;
  attachment_url?: string | null;
  recorded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  project_id: string;
  project?: { name: string } | null;
  category_id?: string | null;
  category?: { name: string } | null;
  subcategory_id?: string | null;
  subcategory?: { name: string } | null;
  assigned_to?: string | null;
  priority: ProjectPriority;
  status: TaskStatus;
  start_date?: string | null;
  due_date?: string | null;
  description?: string | null;
  estimated_cost: number;
  actual_cost: number;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  client_id?: string | null;
  project_id?: string | null;
  lead_id?: string | null;
  deal_id?: string | null;
  user_id: string;
  type: ActivityType;
  activity_date: string;
  title: string;
  description?: string | null;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
  entity_type: "lead" | "client" | "company" | "deal" | "project" | "invoice" | "vendor_bill";
  entity_id: string;
  uploaded_by?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  action: string;
  entity: string;
  record_id?: string | null;
  record_title?: string | null;
  previous_state?: Record<string, unknown> | null;
  new_state?: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "alert" | "success";
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

// --- FINANCIAL SUMMARY INTERFACES ---

export interface ProjectProfitabilitySummary {
  projectId: string;
  projectName: string;
  clientName: string;
  contractValue: number;
  collectedAmount: number;
  outstandingAmount: number;
  clientPending: number;
  overallBudget: number;
  totalActualCost: number;
  availableBalance: number;
  remainingBudget: number;
  budgetUtilizationPct: number;
  grossProfit: number;
  grossMarginPct: number;
  expectedProfit: number;
  expectedMarginPct: number;
  status: ProjectStatus;
  categories: {
    categoryId: string;
    categoryName: string;
    budget: number;
    actualCost: number;
    remaining: number;
    utilizationPct: number;
    status: "healthy" | "warning" | "at_limit" | "over_budget";
  }[];
}
