// ==============================================================================
// WEXLOGIC CRM — Resilient Data Access & Persistence Engine (lib/crm-db.ts)
// Connects to Supabase PostgreSQL with automated fallback to persistent store
// ==============================================================================

import { cache } from "react";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/utils/auth";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

let _supabaseClient: SupabaseClient<any, "public", any> | null = null;
function getSupabase(): SupabaseClient<any, "public", any> {
  if (!_supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ouhspvghkibefdxpbhsp.supabase.co";
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      "sb_publishable_3OW5PKsiPeVn49gQV34lfQ_aTVr3LVK";
    _supabaseClient = createSupabaseClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return _supabaseClient;
}
import type {
  Company,
  Client,
  Service,
  Lead,
  Deal,
  Project,
  ProjectCategory,
  ProjectSubcategory,
  Vendor,
  Expense,
  VendorBill,
  Invoice,
  InvoiceItem,
  ClientPayment,
  Task,
  Activity,
  AuditLog,
  NotificationItem,
  ProjectProfitabilitySummary,
} from "@/types/crm";
import {
  calcGrossProfit,
  calcGrossMarginPct,
  calcUtilizationPct,
  getBudgetHealth,
  calcOutstandingBalance,
} from "@/utils/finance-calc";
import { getUserDisplayName } from "@/utils/auth";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "crm-store.json");

interface CrmStore {
  companies: Company[];
  clients: Client[];
  services: Service[];
  leads: Lead[];
  deals: Deal[];
  projects: Project[];
  project_categories: ProjectCategory[];
  project_subcategories: ProjectSubcategory[];
  vendors: Vendor[];
  expenses: Expense[];
  vendor_bills: VendorBill[];
  invoices: Invoice[];
  invoice_items: InvoiceItem[];
  client_payments: ClientPayment[];
  tasks: Task[];
  activities: Activity[];
  audit_logs: AuditLog[];
  notifications: NotificationItem[];
}

const INITIAL_SEED: CrmStore = {
  companies: [],
  clients: [],
  services: [
    {
      id: "srv-1",
      name: "Meta Ads",
      category: "Digital Marketing",
      description: "Paid social performance advertising & retargeting",
      base_price: 100000,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "srv-2",
      name: "Decoration & Production",
      category: "Event Production",
      description: "Stage design, venue decoration & lighting",
      base_price: 100000,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "srv-3",
      name: "Modeling & Talent Management",
      category: "Talent",
      description: "Brand ambassadors, runway models & styling",
      base_price: 60000,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "srv-4",
      name: "Photography",
      category: "Creative",
      description: "Event coverage & high-res media",
      base_price: 40000,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "srv-5",
      name: "Video Production",
      category: "Creative",
      description: "Teasers, recap films & live cinematography",
      base_price: 70000,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  leads: [],
  deals: [],
  projects: [],
  project_categories: [],
  project_subcategories: [],
  vendors: [],
  expenses: [],
  vendor_bills: [],
  invoices: [],
  invoice_items: [],
  client_payments: [],
  tasks: [],
  activities: [],
  audit_logs: [],
  notifications: [],
};

// Ensure local persistence store exists
async function getStore(): Promise<CrmStore> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    // If not exists, save initial seed
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(INITIAL_SEED, null, 2), "utf-8");
    return INITIAL_SEED;
  }
}

async function saveStore(store: CrmStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

// ==============================================================================
// CRUD REPOSITORY METHODS
// ==============================================================================

// --- COMPANIES ---
export const getCompanies = cache(async (): Promise<Company[]> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("companies").select("*").order("name");
    if (!error && data) return data as Company[];
  } catch (err) {
    console.warn("Supabase getCompanies fallback:", err);
  }
  const store = await getStore();
  return store.companies;
});

export async function createCompany(data: Omit<Company, "id" | "created_at" | "updated_at">): Promise<Company> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const newComp: Company = {
    ...data,
    id,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("companies").insert(newComp);
  } catch (err) {
    console.warn("Supabase createCompany failed:", err);
  }

  const store = await getStore();
  store.companies.unshift(newComp);
  await saveStore(store);
  await logAuditAction("create", "company", newComp.id, null, newComp);
  return newComp;
}

export async function updateCompany(id: string, data: Partial<Company>): Promise<Company | null> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    const { data: updated } = await supabase.from("companies").update({ ...data, updated_at: now }).eq("id", id).select().single();
    if (updated) return updated as Company;
  } catch (err) { console.warn("Supabase updateCompany failed:", err); }
  const store = await getStore();
  const item = store.companies.find((c) => c.id === id);
  if (!item) return null;
  const prev = { ...item };
  Object.assign(item, data, { updated_at: now });
  await saveStore(store);
  await logAuditAction("update", "company", id, prev, item);
  return item;
}

export async function deleteCompany(id: string): Promise<boolean> {
  try { const supabase = getSupabase(); await supabase.from("companies").delete().eq("id", id); } catch (err) { console.warn("Supabase deleteCompany failed:", err); }
  const store = await getStore();
  const idx = store.companies.findIndex((c) => c.id === id);
  if (idx !== -1) { const removed = store.companies.splice(idx, 1)[0]; await saveStore(store); await logAuditAction("delete", "company", id, removed, null); }
  return true;
}

// --- CLIENTS ---
export const getClients = cache(async (): Promise<Client[]> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("clients")
      .select("*, company:companies(*)")
      .order("created_at", { ascending: false });
    if (!error && data) return data as Client[];
  } catch (err) {
    console.warn("Supabase getClients fallback:", err);
  }
  const store = await getStore();
  return store.clients;
});

export const getClientById = cache(async (id: string): Promise<Client | null> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("clients")
      .select("*, company:companies(*)")
      .eq("id", id)
      .single();
    if (!error && data) return data as Client;
  } catch (err) {
    console.warn("Supabase getClientById fallback:", err);
  }
  const clients = await getClients();
  return clients.find((c) => c.id === id) || null;
});

export async function createClient(data: Partial<Client>): Promise<Client> {
  const user = await getCurrentUser();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newClient: Client = {
    id,
    name: data.name || "Unnamed Client",
    company_name: data.company_name || "",
    company_id: data.company_id || null,
    email: data.email || "",
    phone: data.phone || null,
    alternate_phone: data.alternate_phone || null,
    designation: data.designation || null,
    website: data.website || null,
    industry: data.industry || null,
    address: data.address || null,
    city: data.city || null,
    state: data.state || null,
    country: data.country || "India",
    gst_number: data.gst_number || null,
    source: data.source || "Website",
    status: data.status || "active",
    tags: data.tags || [],
    notes: data.notes || null,
    created_by: user?.id || null,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("clients").insert({
      id: newClient.id,
      name: newClient.name,
      company_name: newClient.company_name,
      company_id: newClient.company_id,
      email: newClient.email,
      phone: newClient.phone,
      alternate_phone: newClient.alternate_phone,
      designation: newClient.designation,
      website: newClient.website,
      industry: newClient.industry,
      address: newClient.address,
      city: newClient.city,
      state: newClient.state,
      country: newClient.country,
      gst_number: newClient.gst_number,
      source: newClient.source,
      status: newClient.status,
      tags: newClient.tags,
      notes: newClient.notes,
      created_by: newClient.created_by,
      created_at: newClient.created_at,
      updated_at: newClient.updated_at,
    });
  } catch (err) {
    console.warn("Supabase createClient failed:", err);
  }

  const store = await getStore();
  store.clients.unshift(newClient);
  await saveStore(store);
  await logAuditAction("create", "client", newClient.id, null, newClient);
  return newClient;
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client | null> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    const { data: updated } = await supabase.from("clients").update({ ...data, updated_at: now }).eq("id", id).select().single();
    if (updated) return updated as Client;
  } catch (err) { console.warn("Supabase updateClient failed:", err); }
  const store = await getStore();
  const item = store.clients.find((c) => c.id === id);
  if (!item) return null;
  const prev = { ...item };
  Object.assign(item, data, { updated_at: now });
  await saveStore(store);
  await logAuditAction("update", "client", id, prev, item);
  return item;
}

export async function deleteClient(id: string): Promise<boolean> {
  try { const supabase = getSupabase(); await supabase.from("clients").delete().eq("id", id); } catch (err) { console.warn("Supabase deleteClient failed:", err); }
  const store = await getStore();
  const idx = store.clients.findIndex((c) => c.id === id);
  if (idx !== -1) { const removed = store.clients.splice(idx, 1)[0]; await saveStore(store); await logAuditAction("delete", "client", id, removed, null); }
  return true;
}

// --- LEADS & CONVERSION ---
export const getLeads = cache(async (): Promise<Lead[]> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) return data as Lead[];
  } catch (err) {
    console.warn("Supabase getLeads fallback:", err);
  }
  const store = await getStore();
  return store.leads;
});

export const getLeadById = cache(async (id: string): Promise<Lead | null> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
    if (!error && data) return data as Lead;
  } catch (err) {
    console.warn("Supabase getLeadById fallback:", err);
  }
  const leads = await getLeads();
  return leads.find((l) => l.id === id) || null;
});

export async function createLead(data: Partial<Lead>): Promise<Lead> {
  const user = await getCurrentUser();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  let count = 101;
  try {
    const supabase = getSupabase();
    const { count: c } = await supabase.from("leads").select("*", { count: "exact", head: true });
    count = (c || 0) + 101;
  } catch {
    const store = await getStore();
    count = store.leads.length + 101;
  }

  const newLead: Lead = {
    id,
    lead_code: `LEAD-${count}`,
    full_name: data.full_name || "New Lead",
    company_name: data.company_name || null,
    email: data.email || null,
    phone: data.phone || null,
    alternate_phone: data.alternate_phone || null,
    designation: data.designation || null,
    website: data.website || null,
    industry: data.industry || null,
    location: data.location || null,
    source: data.source || "Website",
    status: data.status || "new",
    lead_value: Number(data.lead_value) || 0,
    expected_close_date: data.expected_close_date || null,
    next_follow_up: data.next_follow_up || null,
    tags: data.tags || [],
    notes: data.notes || null,
    created_by: user?.id || null,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("leads").insert(newLead);
  } catch (err) {
    console.warn("Supabase createLead failed:", err);
  }

  const store = await getStore();
  store.leads.unshift(newLead);
  await saveStore(store);
  await logAuditAction("create", "lead", newLead.id, null, newLead);
  return newLead;
}

export async function updateLeadStatus(id: string, status: Lead["status"]): Promise<Lead | null> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("leads")
      .update({ status, updated_at: now })
      .eq("id", id)
      .select()
      .single();
    if (data) return data as Lead;
  } catch (err) {
    console.warn("Supabase updateLeadStatus failed:", err);
  }

  const store = await getStore();
  const lead = store.leads.find((l) => l.id === id);
  if (!lead) return null;
  const prev = { ...lead };
  lead.status = status;
  lead.updated_at = now;
  await saveStore(store);
  await logAuditAction("update", "lead", lead.id, prev, lead);
  return lead;
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead | null> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    const { data: updated } = await supabase
      .from("leads")
      .update({ ...data, updated_at: now })
      .eq("id", id)
      .select()
      .single();
    if (updated) return updated as Lead;
  } catch (err) {
    console.warn("Supabase updateLead failed:", err);
  }

  const store = await getStore();
  const lead = store.leads.find((l) => l.id === id);
  if (!lead) return null;
  const prev = { ...lead };
  Object.assign(lead, data, { updated_at: now });
  await saveStore(store);
  await logAuditAction("update", "lead", lead.id, prev, lead);
  return lead;
}

export async function deleteLead(id: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    await supabase.from("leads").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase deleteLead failed:", err);
  }

  const store = await getStore();
  const index = store.leads.findIndex((l) => l.id === id);
  if (index !== -1) {
    const removed = store.leads.splice(index, 1)[0];
    await saveStore(store);
    await logAuditAction("delete", "lead", id, removed, null);
  }
  return true;
}

export async function convertLeadToClient(
  leadId: string
): Promise<{ client: Client; lead: Lead } | null> {
  const lead = await getLeadById(leadId);
  if (!lead) return null;

  const newClient = await createClient({
    name: lead.full_name,
    company_name: lead.company_name || lead.full_name,
    email: lead.email || "",
    phone: lead.phone,
    designation: lead.designation,
    industry: lead.industry,
    source: lead.source,
    notes: `Converted from Lead ${lead.lead_code || lead.id}. Original notes: ${lead.notes || "None"}`,
    status: "active",
  });

  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    await supabase
      .from("leads")
      .update({ status: "won", converted_client_id: newClient.id, updated_at: now })
      .eq("id", leadId);
  } catch (err) {
    console.warn("Supabase convertLead update failed:", err);
  }

  lead.status = "won";
  lead.converted_client_id = newClient.id;
  lead.updated_at = now;

  await createActivity({
    client_id: newClient.id,
    lead_id: lead.id,
    type: "note",
    title: "Lead Converted to Client",
    description: `Lead ${lead.full_name} was officially converted to Client account ${newClient.name}.`,
  });

  await logAuditAction(
    "convert",
    "lead",
    lead.id,
    { status: "qualified" },
    { status: "won", converted_client_id: newClient.id }
  );

  return { client: newClient, lead };
}

// --- DEALS ---
export const getDeals = cache(async (): Promise<Deal[]> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("deals")
      .select("*, client:clients(*), service:services(*), company:companies(*)")
      .order("created_at", { ascending: false });
    if (!error && data) return data as Deal[];
  } catch (err) {
    console.warn("Supabase getDeals fallback:", err);
  }
  const store = await getStore();
  const clients = await getClients();
  const services = await getServices();
  return store.deals.map((d) => ({
    ...d,
    client: clients.find((c) => c.id === d.client_id) || null,
    service: services.find((s) => s.id === d.service_id) || null,
  }));
});

export async function createDeal(data: Partial<Deal>): Promise<Deal> {
  const user = await getCurrentUser();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newDeal: Deal = {
    id,
    deal_name: data.deal_name || "New Deal",
    client_id: data.client_id!,
    company_id: data.company_id || null,
    service_id: data.service_id || null,
    estimated_value: Number(data.estimated_value) || 0,
    stage: data.stage || "new",
    probability: Number(data.probability) || 20,
    expected_close_date: data.expected_close_date || null,
    source: data.source || null,
    notes: data.notes || null,
    created_by: user?.id || null,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("deals").insert(newDeal);
  } catch (err) {
    console.warn("Supabase createDeal failed, using store:", err);
  }

  const store = await getStore();
  store.deals.unshift(newDeal);
  await saveStore(store);
  await logAuditAction("create", "deal", newDeal.id, null, newDeal);
  return newDeal;
}

export async function updateDealStage(id: string, stage: Deal["stage"]): Promise<Deal | null> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("deals")
      .update({ stage, updated_at: now })
      .eq("id", id)
      .select()
      .single();
    if (data) return data as Deal;
  } catch (err) {
    console.warn("Supabase updateDealStage failed:", err);
  }

  const store = await getStore();
  const deal = store.deals.find((d) => d.id === id);
  if (!deal) return null;
  const prev = { ...deal };
  deal.stage = stage;
  deal.updated_at = now;
  await saveStore(store);
  await logAuditAction("update", "deal", deal.id, prev, deal);
  return deal;
}

export async function updateDeal(id: string, data: Partial<Deal>): Promise<Deal | null> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    const { data: updated } = await supabase.from("deals").update({ ...data, updated_at: now }).eq("id", id).select().single();
    if (updated) return updated as Deal;
  } catch (err) { console.warn("Supabase updateDeal failed:", err); }
  const store = await getStore();
  const item = store.deals.find((d) => d.id === id);
  if (!item) return null;
  const prev = { ...item };
  Object.assign(item, data, { updated_at: now });
  await saveStore(store);
  await logAuditAction("update", "deal", id, prev, item);
  return item;
}

export async function deleteDeal(id: string): Promise<boolean> {
  try { const supabase = getSupabase(); await supabase.from("deals").delete().eq("id", id); } catch (err) { console.warn("Supabase deleteDeal failed:", err); }
  const store = await getStore();
  const idx = store.deals.findIndex((d) => d.id === id);
  if (idx !== -1) { const removed = store.deals.splice(idx, 1)[0]; await saveStore(store); await logAuditAction("delete", "deal", id, removed, null); }
  return true;
}

// --- SERVICES ---
export const getServices = cache(async (): Promise<Service[]> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("services").select("*").order("name");
    if (!error && data) return data as Service[];
  } catch (err) {
    console.warn("Supabase getServices fallback:", err);
  }
  const store = await getStore();
  return store.services;
});

// --- PROJECTS & CATEGORIES ---
export const getProjects = cache(async (): Promise<Project[]> => {
  let rawProjects: Project[] = [];
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("projects")
      .select("*, client:clients(*), company:companies(*)")
      .order("created_at", { ascending: false });
    if (!error && data) rawProjects = data as Project[];
  } catch (err) {
    console.warn("Supabase getProjects fallback:", err);
  }

  if (rawProjects.length === 0) {
    const store = await getStore();
    const clients = await getClients();
    rawProjects = store.projects.map((p) => ({
      ...p,
      client: clients.find((c) => c.id === p.client_id) || null,
    }));
  }

  const [expenses, payments] = await Promise.all([
    getExpenses(),
    getClientPayments(),
  ]);

  return rawProjects.map((proj) => {
    const projectExpenses = expenses.filter((e) => e.project_id === proj.id);
    const totalActualCost = projectExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const projectPayments = payments.filter(
      (p) => p.project_id === proj.id && p.status === "completed"
    );
    const totalCollected = projectPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalOutstanding = Math.max(0, proj.project_value - totalCollected);

    const grossProfit = calcGrossProfit(proj.project_value, totalActualCost);
    const grossMargin = calcGrossMarginPct(proj.project_value, totalActualCost);
    const remainingBudget = Math.max(0, proj.overall_budget - totalActualCost);

    return {
      ...proj,
      totalActualCost,
      totalCollected,
      totalOutstanding,
      grossProfit,
      grossMargin,
      remainingBudget,
    };
  });
});

export const getProjectById = cache(async (id: string): Promise<Project | null> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("projects")
      .select("*, client:clients(*), company:companies(*)")
      .eq("id", id)
      .single();

    if (!error && data) {
      const proj = data as Project;
      const [categories, expenses, payments] = await Promise.all([
        getProjectCategories(id),
        getExpenses(id),
        getClientPayments(undefined, id),
      ]);
      const totalActualCost = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const totalCollected = payments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const totalOutstanding = Math.max(0, proj.project_value - totalCollected);
      const grossProfit = calcGrossProfit(proj.project_value, totalActualCost);
      const grossMargin = calcGrossMarginPct(proj.project_value, totalActualCost);
      const remainingBudget = Math.max(0, proj.overall_budget - totalActualCost);

      return {
        ...proj,
        categories,
        totalActualCost,
        totalCollected,
        totalOutstanding,
        grossProfit,
        grossMargin,
        remainingBudget,
      };
    }
  } catch (err) {
    console.warn("Supabase getProjectById fallback:", err);
  }

  const projects = await getProjects();
  const project = projects.find((p) => p.id === id);
  if (!project) return null;
  project.categories = await getProjectCategories(id);
  return project;
});

export async function createProject(data: Partial<Project>): Promise<Project> {
  const user = await getCurrentUser();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  let count = 1;
  try {
    const supabase = getSupabase();
    const { count: c } = await supabase.from("projects").select("*", { count: "exact", head: true });
    count = (c || 0) + 1;
  } catch {
    const store = await getStore();
    count = store.projects.length + 1;
  }

  const newProj: Project = {
    id,
    project_code: `PRJ-2026-${String(count).padStart(3, "0")}`,
    name: data.name || "New Project",
    client_id: data.client_id!,
    company_id: data.company_id || null,
    description: data.description || "",
    project_value: Number(data.project_value) || 0,
    overall_budget: Number(data.overall_budget) || 0,
    start_date: data.start_date || new Date().toISOString().split("T")[0],
    end_date: data.end_date || null,
    status: data.status || "planned",
    priority: data.priority || "medium",
    notes: data.notes || null,
    quotation_number: data.quotation_number || null,
    quotation_date: data.quotation_date || null,
    quotation_expiry_date: data.quotation_expiry_date || null,
    quotation_pdf_url: data.quotation_pdf_url || null,
    quotation_data: data.quotation_data || null,
    created_by: user?.id || null,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("projects").insert(newProj);
  } catch (err) {
    console.warn("Supabase createProject failed, using store:", err);
  }

  const store = await getStore();
  store.projects.unshift(newProj);
  await saveStore(store);
  await logAuditAction("create", "project", newProj.id, null, newProj);
  return newProj;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    const { data: updated } = await supabase.from("projects").update({ ...data, updated_at: now }).eq("id", id).select().single();
    if (updated) return updated as Project;
  } catch (err) { console.warn("Supabase updateProject failed:", err); }
  const store = await getStore();
  const item = store.projects.find((p) => p.id === id);
  if (!item) return null;
  const prev = { ...item };
  Object.assign(item, data, { updated_at: now });
  await saveStore(store);
  await logAuditAction("update", "project", id, prev, item);
  return item;
}

export async function deleteProject(id: string): Promise<boolean> {
  try { const supabase = getSupabase(); await supabase.from("projects").delete().eq("id", id); } catch (err) { console.warn("Supabase deleteProject failed:", err); }
  const store = await getStore();
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx !== -1) { const removed = store.projects.splice(idx, 1)[0]; await saveStore(store); await logAuditAction("delete", "project", id, removed, null); }
  return true;
}

export async function saveProjectQuotation(
  projectId: string,
  quotationData: {
    quotationNumber: string;
    quotationDate?: string;
    expiryDate?: string;
    data?: any;
    pdfUrl?: string | null;
  }
): Promise<Project | null> {
  const updatePayload: Partial<Project> = {
    quotation_number: quotationData.quotationNumber,
    quotation_date: quotationData.quotationDate || null,
    quotation_expiry_date: quotationData.expiryDate || null,
    quotation_data: quotationData.data || null,
  };
  if (quotationData.pdfUrl) {
    updatePayload.quotation_pdf_url = quotationData.pdfUrl;
  }
  return await updateProject(projectId, updatePayload);
}

export async function uploadPdfToSupabaseStorage(
  bucket: "quotations" | "invoices" | "documents",
  filePath: string,
  fileBuffer: Buffer | Uint8Array,
  contentType: string = "application/pdf"
): Promise<string | null> {
  try {
    const supabase = getSupabase();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.warn(`Supabase Storage upload to bucket '${bucket}' failed:`, uploadError);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data?.publicUrl || null;
  } catch (err) {
    console.warn("Supabase Storage error:", err);
    return null;
  }
}

export const getProjectCategories = cache(async (projectId: string): Promise<ProjectCategory[]> => {
  let categories: ProjectCategory[] = [];
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("project_categories")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order");
    if (!error && data) categories = data as ProjectCategory[];
  } catch (err) {
    console.warn("Supabase getProjectCategories fallback:", err);
  }

  if (categories.length === 0) {
    const store = await getStore();
    categories = store.project_categories.filter((c) => c.project_id === projectId);
  }

  const expenses = await getExpenses(projectId);

  return categories.map((cat) => {
    const catExpenses = expenses.filter((e) => e.category_id === cat.id);
    const actual_cost = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const remaining_budget = cat.budget - actual_cost;
    const utilization_pct = calcUtilizationPct(actual_cost, cat.budget);

    return {
      ...cat,
      actual_cost,
      remaining_budget,
      utilization_pct,
    };
  });
});

export async function createProjectCategory(data: {
  project_id: string;
  name: string;
  budget: number;
}): Promise<ProjectCategory> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  let sortOrder = 1;
  try {
    const supabase = getSupabase();
    const { count } = await supabase
      .from("project_categories")
      .select("*", { count: "exact", head: true })
      .eq("project_id", data.project_id);
    sortOrder = (count || 0) + 1;
  } catch {
    const store = await getStore();
    sortOrder = store.project_categories.filter((c) => c.project_id === data.project_id).length + 1;
  }

  const newCat: ProjectCategory = {
    id,
    project_id: data.project_id,
    name: data.name,
    budget: Number(data.budget) || 0,
    sort_order: sortOrder,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("project_categories").insert(newCat);
  } catch (err) {
    console.warn("Supabase createProjectCategory failed, using store:", err);
  }

  const store = await getStore();
  store.project_categories.push(newCat);
  await saveStore(store);
  await logAuditAction("create", "project_category", newCat.id, null, newCat);
  return newCat;
}

// --- EXPENSES ---
export const getExpenses = cache(async (projectId?: string): Promise<Expense[]> => {
  try {
    const supabase = getSupabase();
    let query = supabase
      .from("expenses")
      .select("*, project:projects(name), category:project_categories(name), vendor:vendors(name), client:clients(name, company_name)")
      .order("expense_date", { ascending: false });

    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query;
    if (!error && data) return data as Expense[];
  } catch (err) {
    console.warn("Supabase getExpenses fallback:", err);
  }

  const store = await getStore();
  let list = store.expenses;
  if (projectId) list = list.filter((e) => e.project_id === projectId);
  return list.map((e) => ({
    ...e,
    project: store.projects.find((p) => p.id === e.project_id) || null,
    category: store.project_categories.find((c) => c.id === e.category_id) || null,
    vendor: store.vendors.find((v) => v.id === e.vendor_id) || null,
  }));
});

export async function createExpense(data: Partial<Expense>): Promise<Expense> {
  const user = await getCurrentUser();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newExpense: Expense = {
    id,
    project_id: data.project_id!,
    client_id: data.client_id || null,
    category_id: data.category_id || null,
    subcategory_id: data.subcategory_id || null,
    vendor_id: data.vendor_id || null,
    description: data.description || "Expense",
    amount: Number(data.amount) || 0,
    expense_date: data.expense_date || new Date().toISOString().split("T")[0],
    payment_status: data.payment_status || "paid",
    payment_method: data.payment_method || "bank_transfer",
    bill_number: data.bill_number || null,
    receipt_ref: data.receipt_ref || null,
    notes: data.notes || null,
    created_by: user?.id || null,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("expenses").insert(newExpense);
  } catch (err) {
    console.warn("Supabase createExpense failed, using store:", err);
  }

  const store = await getStore();
  store.expenses.unshift(newExpense);
  await saveStore(store);

  // Check budget utilization and alert if >= 90%
  if (newExpense.category_id) {
    const categories = await getProjectCategories(newExpense.project_id);
    const cat = categories.find((c) => c.id === newExpense.category_id);
    if (cat && (cat.utilization_pct || 0) >= 90) {
      await createNotification({
        user_id: user?.id || "admin",
        title: `Budget Alert: ${cat.name}`,
        message: `${cat.name} has reached ${cat.utilization_pct?.toFixed(1)}% of its allocated budget.`,
        type: (cat.utilization_pct || 0) >= 100 ? "alert" : "warning",
        link: `/dashboard/projects/${newExpense.project_id}`,
      });
    }
  }

  await logAuditAction("create", "expense", newExpense.id, null, newExpense);
  return newExpense;
}

export async function updateExpense(id: string, data: Partial<Expense>): Promise<Expense | null> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    const { data: updated } = await supabase.from("expenses").update({ ...data, updated_at: now }).eq("id", id).select().single();
    if (updated) return updated as Expense;
  } catch (err) { console.warn("Supabase updateExpense failed:", err); }
  const store = await getStore();
  const item = store.expenses.find((e) => e.id === id);
  if (!item) return null;
  const prev = { ...item };
  Object.assign(item, data, { updated_at: now });
  await saveStore(store);
  await logAuditAction("update", "expense", id, prev, item);
  return item;
}

export async function deleteExpense(id: string): Promise<boolean> {
  try { const supabase = getSupabase(); await supabase.from("expenses").delete().eq("id", id); } catch (err) { console.warn("Supabase deleteExpense failed:", err); }
  const store = await getStore();
  const idx = store.expenses.findIndex((e) => e.id === id);
  if (idx !== -1) { const removed = store.expenses.splice(idx, 1)[0]; await saveStore(store); await logAuditAction("delete", "expense", id, removed, null); }
  return true;
}


export const getVendors = cache(async (): Promise<Vendor[]> => {
  let vendors: Vendor[] = [];
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("vendors").select("*").order("name");
    if (!error && data) vendors = data as Vendor[];
  } catch (err) {
    console.warn("Supabase getVendors fallback:", err);
  }

  if (vendors.length === 0) {
    const store = await getStore();
    vendors = store.vendors;
  }

  const bills = await getVendorBills();
  return vendors.map((v) => {
    const vendorBills = bills.filter((b) => b.vendor_id === v.id);
    const total_bills = vendorBills.reduce((sum, b) => sum + Number(b.total_amount), 0);
    const total_paid = vendorBills
      .filter((b) => b.payment_status === "paid")
      .reduce((sum, b) => sum + Number(b.total_amount), 0);
    const total_pending = total_bills - total_paid;
    return {
      ...v,
      total_bills,
      total_paid,
      total_pending,
    };
  });
});

export async function createVendor(data: Partial<Vendor>): Promise<Vendor> {
  const user = await getCurrentUser();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newVendor: Vendor = {
    id,
    name: data.name || "Unnamed Vendor",
    company_name: data.company_name || null,
    phone: data.phone || null,
    email: data.email || null,
    category: data.category || "General",
    address: data.address || null,
    gst_number: data.gst_number || null,
    status: "active",
    notes: data.notes || null,
    created_by: user?.id || null,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("vendors").insert(newVendor);
  } catch (err) {
    console.warn("Supabase createVendor failed, using store:", err);
  }

  const store = await getStore();
  store.vendors.unshift(newVendor);
  await saveStore(store);
  await logAuditAction("create", "vendor", newVendor.id, null, newVendor);
  return newVendor;
}

export async function updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor | null> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    const { data: updated } = await supabase.from("vendors").update({ ...data, updated_at: now }).eq("id", id).select().single();
    if (updated) return updated as Vendor;
  } catch (err) { console.warn("Supabase updateVendor failed:", err); }
  const store = await getStore();
  const item = store.vendors.find((v) => v.id === id);
  if (!item) return null;
  const prev = { ...item };
  Object.assign(item, data, { updated_at: now });
  await saveStore(store);
  await logAuditAction("update", "vendor", id, prev, item);
  return item;
}

export async function deleteVendor(id: string): Promise<boolean> {
  try { const supabase = getSupabase(); await supabase.from("vendors").delete().eq("id", id); } catch (err) { console.warn("Supabase deleteVendor failed:", err); }
  const store = await getStore();
  const idx = store.vendors.findIndex((v) => v.id === id);
  if (idx !== -1) { const removed = store.vendors.splice(idx, 1)[0]; await saveStore(store); await logAuditAction("delete", "vendor", id, removed, null); }
  return true;
}

export const getVendorBills = cache(async (vendorId?: string, projectId?: string): Promise<VendorBill[]> => {
  try {
    const supabase = getSupabase();
    let query = supabase
      .from("vendor_bills")
      .select("*, vendor:vendors(name), project:projects(name), category:project_categories(name)")
      .order("bill_date", { ascending: false });

    if (vendorId) query = query.eq("vendor_id", vendorId);
    if (projectId) query = query.eq("project_id", projectId);

    const { data, error } = await query;
    if (!error && data) return data as VendorBill[];
  } catch (err) {
    console.warn("Supabase getVendorBills fallback:", err);
  }

  const store = await getStore();
  let bills = store.vendor_bills;
  if (vendorId) bills = bills.filter((b) => b.vendor_id === vendorId);
  if (projectId) bills = bills.filter((b) => b.project_id === projectId);
  return bills.map((b) => ({
    ...b,
    vendor: store.vendors.find((v) => v.id === b.vendor_id) || null,
    project: store.projects.find((p) => p.id === b.project_id) || null,
  }));
});

export async function createVendorBill(data: Partial<VendorBill>): Promise<VendorBill> {
  const user = await getCurrentUser();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  let count = 101;
  try {
    const supabase = getSupabase();
    const { count: c } = await supabase.from("vendor_bills").select("*", { count: "exact", head: true });
    count = (c || 0) + 101;
  } catch {
    const store = await getStore();
    count = store.vendor_bills.length + 101;
  }

  const amount = Number(data.amount) || 0;
  const tax = Number(data.tax) || 0;
  const total_amount = amount + tax;

  const newBill: VendorBill = {
    id,
    vendor_id: data.vendor_id!,
    project_id: data.project_id || null,
    category_id: data.category_id || null,
    subcategory_id: data.subcategory_id || null,
    bill_number: data.bill_number || `VB-${count}`,
    bill_date: data.bill_date || new Date().toISOString().split("T")[0],
    due_date: data.due_date || null,
    amount,
    tax,
    total_amount,
    payment_status: data.payment_status || "pending",
    notes: data.notes || null,
    created_by: user?.id || null,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("vendor_bills").insert(newBill);
  } catch (err) {
    console.warn("Supabase createVendorBill failed, using store:", err);
  }

  const store = await getStore();
  store.vendor_bills.unshift(newBill);
  await saveStore(store);
  await logAuditAction("create", "vendor_bill", newBill.id, null, newBill);
  return newBill;
}

export async function updateVendorBill(id: string, data: Partial<VendorBill>): Promise<VendorBill | null> {
  const now = new Date().toISOString();
  const amount = data.amount !== undefined ? Number(data.amount) : undefined;
  const tax = data.tax !== undefined ? Number(data.tax) : undefined;
  const updateData = { ...data, ...(amount !== undefined && tax !== undefined ? { total_amount: amount + tax } : {}), updated_at: now };
  try {
    const supabase = getSupabase();
    const { data: updated } = await supabase.from("vendor_bills").update(updateData).eq("id", id).select().single();
    if (updated) return updated as VendorBill;
  } catch (err) { console.warn("Supabase updateVendorBill failed:", err); }
  const store = await getStore();
  const item = store.vendor_bills.find((b) => b.id === id);
  if (!item) return null;
  const prev = { ...item };
  Object.assign(item, updateData);
  await saveStore(store);
  await logAuditAction("update", "vendor_bill", id, prev, item);
  return item;
}

export async function deleteVendorBill(id: string): Promise<boolean> {
  try { const supabase = getSupabase(); await supabase.from("vendor_bills").delete().eq("id", id); } catch (err) { console.warn("Supabase deleteVendorBill failed:", err); }
  const store = await getStore();
  const idx = store.vendor_bills.findIndex((b) => b.id === id);
  if (idx !== -1) { const removed = store.vendor_bills.splice(idx, 1)[0]; await saveStore(store); await logAuditAction("delete", "vendor_bill", id, removed, null); }
  return true;
}


export const getInvoices = cache(async (clientId?: string, projectId?: string): Promise<Invoice[]> => {
  try {
    const supabase = getSupabase();
    let query = supabase
      .from("invoices")
      .select("*, client:clients(*), project:projects(name), items:invoice_items(*)")
      .order("issue_date", { ascending: false });

    if (clientId) query = query.eq("client_id", clientId);
    if (projectId) query = query.eq("project_id", projectId);

    const { data, error } = await query;
    if (!error && data) return data as Invoice[];
  } catch (err) {
    console.warn("Supabase getInvoices fallback:", err);
  }

  const store = await getStore();
  let list = store.invoices;
  if (clientId) list = list.filter((i) => i.client_id === clientId);
  if (projectId) list = list.filter((i) => i.project_id === projectId);
  return list.map((inv) => ({
    ...inv,
    client: store.clients.find((c) => c.id === inv.client_id) || null,
    project: store.projects.find((p) => p.id === inv.project_id) || null,
    items: store.invoice_items.filter((item) => item.invoice_id === inv.id),
  }));
});

export const getInvoiceById = cache(async (id: string): Promise<Invoice | null> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("invoices")
      .select("*, client:clients(*), project:projects(*), items:invoice_items(*)")
      .eq("id", id)
      .single();
    if (!error && data) return data as Invoice;
  } catch (err) {
    console.warn("Supabase getInvoiceById fallback:", err);
  }

  const invoices = await getInvoices();
  return invoices.find((i) => i.id === id) || null;
});

export async function createInvoice(
  data: Partial<Invoice>,
  items: Array<{ description: string; quantity: number; unit_price: number }> = []
): Promise<Invoice> {
  const user = await getCurrentUser();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  let count = 101;
  try {
    const supabase = getSupabase();
    const { count: c } = await supabase.from("invoices").select("*", { count: "exact", head: true });
    count = (c || 0) + 101;
  } catch {
    const store = await getStore();
    count = store.invoices.length + 101;
  }

  let subtotal = 0;
  items.forEach((item) => {
    subtotal += item.quantity * item.unit_price;
  });
  if (subtotal === 0 && data.total) {
    subtotal = Number(data.total);
  }

  const tax = Number(data.tax) || 0;
  const discount = Number(data.discount) || 0;
  const total = subtotal + tax - discount;

  const newInv: Invoice = {
    id,
    invoice_number: data.invoice_number || `INV-2026-${count}`,
    client_id: data.client_id!,
    project_id: data.project_id || null,
    issue_date: data.issue_date || new Date().toISOString().split("T")[0],
    due_date: data.due_date || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    subtotal,
    tax,
    discount,
    total,
    amount_paid: 0,
    status: data.status || "issued",
    notes: data.notes || null,
    attachment_url: data.attachment_url || null,
    pdf_url: data.pdf_url || data.attachment_url || null,
    quotation_number: data.quotation_number || null,
    created_by: user?.id || null,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("invoices").insert(newInv);

    if (items.length > 0) {
      const invoiceItems = items.map((it) => ({
        id: crypto.randomUUID(),
        invoice_id: newInv.id,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        amount: it.quantity * it.unit_price,
      }));
      await supabase.from("invoice_items").insert(invoiceItems);
    }
  } catch (err) {
    console.warn("Supabase createInvoice failed, using store:", err);
  }

  const store = await getStore();
  store.invoices.unshift(newInv);
  await saveStore(store);
  await logAuditAction("create", "invoice", newInv.id, null, newInv);
  return newInv;
}

export async function updateInvoice(
  id: string,
  data: Partial<Invoice>
): Promise<Invoice | null> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    const { data: updated } = await supabase
      .from("invoices")
      .update({ ...data, updated_at: now })
      .eq("id", id)
      .select()
      .single();
    if (updated) return updated as Invoice;
  } catch (err) {
    console.warn("Supabase updateInvoice failed:", err);
  }
  const store = await getStore();
  const item = store.invoices.find((i) => i.id === id);
  if (!item) return null;
  const prev = { ...item };
  Object.assign(item, data, { updated_at: now });
  await saveStore(store);
  await logAuditAction("update", "invoice", id, prev, item);
  return item;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    await supabase.from("invoices").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase deleteInvoice failed:", err);
  }
  const store = await getStore();
  const idx = store.invoices.findIndex((i) => i.id === id);
  if (idx !== -1) {
    const removed = store.invoices.splice(idx, 1)[0];
    await saveStore(store);
    await logAuditAction("delete", "invoice", id, removed, null);
  }
  return true;
}

export const getClientPayments = cache(async (
  clientId?: string,
  projectId?: string
): Promise<ClientPayment[]> => {
  try {
    const supabase = getSupabase();
    let query = supabase
      .from("client_payments")
      .select("*, client:clients(name, company_name), project:projects(name), invoice:invoices(invoice_number)")
      .order("payment_date", { ascending: false });

    if (clientId) query = query.eq("client_id", clientId);
    if (projectId) query = query.eq("project_id", projectId);

    const { data, error } = await query;
    if (!error && data) return data as ClientPayment[];
  } catch (err) {
    console.warn("Supabase getClientPayments fallback:", err);
  }

  const store = await getStore();
  let list = store.client_payments;
  if (clientId) list = list.filter((p) => p.client_id === clientId);
  if (projectId) list = list.filter((p) => p.project_id === projectId);
  return list.map((p) => ({
    ...p,
    client: store.clients.find((c) => c.id === p.client_id) || null,
    project: store.projects.find((proj) => proj.id === p.project_id) || null,
    invoice: store.invoices.find((inv) => inv.id === p.invoice_id) || null,
  }));
});

export async function createClientPayment(data: Partial<ClientPayment>): Promise<ClientPayment> {
  const user = await getCurrentUser();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  let count = 101;
  try {
    const supabase = getSupabase();
    const { count: c } = await supabase.from("client_payments").select("*", { count: "exact", head: true });
    count = (c || 0) + 101;
  } catch {
    const store = await getStore();
    count = store.client_payments.length + 101;
  }

  const amount = Number(data.amount) || 0;

  const newPayment: ClientPayment = {
    id,
    payment_number: data.payment_number || `PAY-2026-${count}`,
    client_id: data.client_id!,
    project_id: data.project_id || null,
    invoice_id: data.invoice_id || null,
    amount,
    payment_date: data.payment_date || new Date().toISOString().split("T")[0],
    payment_method: data.payment_method || "bank_transfer",
    reference_number: data.reference_number || null,
    status: data.status || "completed",
    notes: data.notes || null,
    recorded_by: user?.id || null,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("client_payments").insert(newPayment);

    // If tied to an invoice, increment invoice.amount_paid
    if (newPayment.invoice_id) {
      const { data: inv } = await supabase
        .from("invoices")
        .select("total, amount_paid")
        .eq("id", newPayment.invoice_id)
        .single();
      if (inv) {
        const newPaid = (Number(inv.amount_paid) || 0) + amount;
        const newStatus = newPaid >= inv.total ? "paid" : "partially_paid";
        await supabase
          .from("invoices")
          .update({ amount_paid: newPaid, status: newStatus, updated_at: now })
          .eq("id", newPayment.invoice_id);
      }
    }
  } catch (err) {
    console.warn("Supabase createClientPayment failed, using store:", err);
  }

  const store = await getStore();
  store.client_payments.unshift(newPayment);
  await saveStore(store);
  await logAuditAction("create", "client_payment", newPayment.id, null, newPayment);
  return newPayment;
}

// --- TASKS ---
export const getTasks = cache(async (projectId?: string): Promise<Task[]> => {
  try {
    const supabase = getSupabase();
    let query = supabase
      .from("tasks")
      .select("*, project:projects(name), category:project_categories(name)")
      .order("created_at", { ascending: false });

    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query;
    if (!error && data) return data as Task[];
  } catch (err) {
    console.warn("Supabase getTasks fallback:", err);
  }

  const store = await getStore();
  let list = store.tasks;
  if (projectId) list = list.filter((t) => t.project_id === projectId);
  return list.map((t) => ({
    ...t,
    project: store.projects.find((p) => p.id === t.project_id) || null,
    category: store.project_categories.find((c) => c.id === t.category_id) || null,
  }));
});

export async function createTask(data: Partial<Task>): Promise<Task> {
  const user = await getCurrentUser();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newTask: Task = {
    id,
    title: data.title || "New Task",
    project_id: data.project_id!,
    category_id: data.category_id || null,
    subcategory_id: data.subcategory_id || null,
    assigned_to: data.assigned_to || user?.id || null,
    priority: data.priority || "medium",
    status: data.status || "todo",
    start_date: data.start_date || null,
    due_date: data.due_date || null,
    description: data.description || null,
    estimated_cost: Number(data.estimated_cost) || 0,
    actual_cost: Number(data.actual_cost) || 0,
    notes: data.notes || null,
    created_by: user?.id || null,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("tasks").insert(newTask);
  } catch (err) {
    console.warn("Supabase createTask failed, using store:", err);
  }

  const store = await getStore();
  store.tasks.unshift(newTask);
  await saveStore(store);
  await logAuditAction("create", "task", newTask.id, null, newTask);
  return newTask;
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    const { data: updated } = await supabase.from("tasks").update({ ...data, updated_at: now }).eq("id", id).select().single();
    if (updated) return updated as Task;
  } catch (err) { console.warn("Supabase updateTask failed:", err); }
  const store = await getStore();
  const item = store.tasks.find((t) => t.id === id);
  if (!item) return null;
  const prev = { ...item };
  Object.assign(item, data, { updated_at: now });
  await saveStore(store);
  await logAuditAction("update", "task", id, prev, item);
  return item;
}

export async function deleteTask(id: string): Promise<boolean> {
  try { const supabase = getSupabase(); await supabase.from("tasks").delete().eq("id", id); } catch (err) { console.warn("Supabase deleteTask failed:", err); }
  const store = await getStore();
  const idx = store.tasks.findIndex((t) => t.id === id);
  if (idx !== -1) { const removed = store.tasks.splice(idx, 1)[0]; await saveStore(store); await logAuditAction("delete", "task", id, removed, null); }
  return true;
}

export async function updateTaskStatus(id: string, status: Task["status"]): Promise<Task | null> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("tasks")
      .update({ status, updated_at: now })
      .eq("id", id)
      .select()
      .single();
    if (data) return data as Task;
  } catch (err) {
    console.warn("Supabase updateTaskStatus failed:", err);
  }

  const store = await getStore();
  const task = store.tasks.find((t) => t.id === id);
  if (!task) return null;
  const prev = { ...task };
  task.status = status;
  task.updated_at = now;
  await saveStore(store);
  await logAuditAction("update", "task", task.id, prev, task);
  return task;
}

// --- ACTIVITIES ---
export const getActivities = cache(async (filter?: {
  clientId?: string;
  projectId?: string;
  leadId?: string;
}): Promise<Activity[]> => {
  try {
    const supabase = getSupabase();
    let query = supabase.from("activities").select("*").order("activity_date", { ascending: false });
    if (filter?.clientId) query = query.eq("client_id", filter.clientId);
    if (filter?.projectId) query = query.eq("project_id", filter.projectId);
    if (filter?.leadId) query = query.eq("lead_id", filter.leadId);

    const { data, error } = await query;
    if (!error && data) return data as Activity[];
  } catch (err) {
    console.warn("Supabase getActivities fallback:", err);
  }

  const store = await getStore();
  let list = store.activities;
  if (filter?.clientId) list = list.filter((a) => a.client_id === filter.clientId);
  if (filter?.projectId) list = list.filter((a) => a.project_id === filter.projectId);
  if (filter?.leadId) list = list.filter((a) => a.lead_id === filter.leadId);
  return list.map((a) => ({
    ...a,
    client: store.clients.find((c) => c.id === a.client_id) || null,
    lead: store.leads.find((l) => l.id === a.lead_id) || null,
    project: store.projects.find((p) => p.id === a.project_id) || null,
  }));
});

export async function createActivity(data: Partial<Activity>): Promise<Activity> {
  const user = await getCurrentUser();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newAct: Activity = {
    id,
    client_id: data.client_id || null,
    project_id: data.project_id || null,
    lead_id: data.lead_id || null,
    deal_id: data.deal_id || null,
    user_id: user?.id || "admin",
    type: data.type || "note",
    activity_date: data.activity_date || now,
    title: data.title || "Note added",
    description: data.description || null,
    created_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("activities").insert(newAct);
  } catch (err) {
    console.warn("Supabase createActivity failed:", err);
  }

  const store = await getStore();
  store.activities.unshift(newAct);
  await saveStore(store);
  await logAuditAction("create", "activity", newAct.id, null, newAct);
  return newAct;
}

export async function updateActivity(id: string, data: Partial<Activity>): Promise<Activity | null> {
  try {
    const supabase = getSupabase();
    const { data: updated } = await supabase.from("activities").update(data).eq("id", id).select().single();
    if (updated) return updated as Activity;
  } catch (err) { console.warn("Supabase updateActivity failed:", err); }
  const store = await getStore();
  const item = store.activities.find((a) => a.id === id);
  if (!item) return null;
  const prev = { ...item };
  Object.assign(item, data);
  await saveStore(store);
  await logAuditAction("update", "activity", id, prev, item);
  return item;
}

export async function deleteActivity(id: string): Promise<boolean> {
  try { const supabase = getSupabase(); await supabase.from("activities").delete().eq("id", id); } catch (err) { console.warn("Supabase deleteActivity failed:", err); }
  const store = await getStore();
  const idx = store.activities.findIndex((a) => a.id === id);
  if (idx !== -1) { const removed = store.activities.splice(idx, 1)[0]; await saveStore(store); await logAuditAction("delete", "activity", id, removed, null); }
  return true;
}


export const getAuditLogs = cache(async (limit = 100): Promise<AuditLog[]> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!error && data && data.length > 0) {
      return (data as AuditLog[]).map((item) => {
        const stateActorName = (item.new_state as any)?._actor_name;
        const stateRecordTitle = (item.new_state as any)?._record_title;
        const resolvedName =
          stateActorName ||
          (item.user_email && item.user_email !== "system"
            ? getUserDisplayName(item.user_email)
            : "System");

        return {
          ...item,
          user_name: resolvedName,
          record_title: stateRecordTitle || item.record_id || null,
        };
      });
    }
  } catch (err) {
    console.warn("Supabase getAuditLogs fallback:", err);
  }

  const store = await getStore();
  return store.audit_logs.slice(0, limit);
});

export async function logAuditAction(
  action: string,
  entity: string,
  record_id?: string | null,
  previous_state?: any,
  new_state?: any,
  actor?: { id?: string; email?: string; name?: string } | null
): Promise<void> {
  try {
    let user: any = null;
    try {
      user = await getCurrentUser();
    } catch {
      // currentUser may not be available outside request context
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const resolvedUserId = actor?.id || user?.id || null;
    const resolvedEmail = actor?.email || user?.emailAddresses?.[0]?.emailAddress || "system";
    const resolvedName =
      actor?.name ||
      (user
        ? getUserDisplayName(user)
        : resolvedEmail !== "system"
        ? getUserDisplayName(resolvedEmail)
        : "System");

    const record_title =
      new_state?.name ||
      new_state?.full_name ||
      new_state?.title ||
      new_state?.invoice_number ||
      new_state?.reference_number ||
      previous_state?.name ||
      previous_state?.title ||
      record_id ||
      null;

    const enrichedNewState = new_state
      ? { ...new_state, _actor_name: resolvedName, _actor_email: resolvedEmail, _record_title: record_title }
      : { _actor_name: resolvedName, _actor_email: resolvedEmail, _record_title: record_title };

    const log: AuditLog = {
      id,
      user_id: resolvedUserId,
      user_email: resolvedEmail,
      user_name: resolvedName,
      action,
      entity,
      record_id: record_id || null,
      record_title: record_title ? String(record_title) : null,
      previous_state: previous_state || null,
      new_state: enrichedNewState,
      created_at: now,
    };

    try {
      const supabase = getSupabase();
      // Insert only the exact schema columns in Supabase public.audit_logs
      await supabase.from("audit_logs").insert({
        id: log.id,
        user_id: log.user_id,
        user_email: log.user_email,
        action: log.action,
        entity: log.entity,
        record_id: log.record_id,
        previous_state: log.previous_state,
        new_state: log.new_state,
        created_at: log.created_at,
      });
    } catch {
      // Local fallback
    }

    const store = await getStore();
    store.audit_logs.unshift(log);
    if (store.audit_logs.length > 500) store.audit_logs = store.audit_logs.slice(0, 500);
    await saveStore(store);
  } catch {
    // Non-blocking
  }
}

export async function getNotifications(userId?: string): Promise<NotificationItem[]> {
  try {
    const supabase = getSupabase();
    let query = supabase.from("notifications").select("*").order("created_at", { ascending: false });
    if (userId) query = query.eq("user_id", userId);
    const { data, error } = await query;
    if (!error && data) return data as NotificationItem[];
  } catch (err) {
    console.warn("Supabase getNotifications fallback:", err);
  }

  const store = await getStore();
  return store.notifications;
}

export async function createNotification(
  data: Partial<NotificationItem>
): Promise<NotificationItem> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const notif: NotificationItem = {
    id,
    user_id: data.user_id || "admin",
    title: data.title || "Notification",
    message: data.message || "",
    type: data.type || "info",
    link: data.link || null,
    is_read: false,
    created_at: now,
  };

  try {
    const supabase = getSupabase();
    await supabase.from("notifications").insert(notif);
  } catch (err) {
    console.warn("Supabase createNotification failed:", err);
  }

  const store = await getStore();
  store.notifications.unshift(notif);
  await saveStore(store);
  return notif;
}

// ==============================================================================
// 14. PROFITABILITY & EXECUTIVE DASHBOARD PULSE
// ==============================================================================

export const getProjectProfitability = cache(async (
  projectId: string
): Promise<ProjectProfitabilitySummary | null> => {
  const project = await getProjectById(projectId);
  if (!project) return null;

  const categories = await getProjectCategories(projectId);
  const totalActualCost = project.totalActualCost || 0;
  const contractValue = project.project_value;
  const collectedAmount = project.totalCollected || 0;
  const outstandingAmount = Math.max(0, contractValue - collectedAmount);
  const overallBudget = project.overall_budget;
  const remainingBudget = Math.max(0, overallBudget - totalActualCost);
  const budgetUtilizationPct = calcUtilizationPct(totalActualCost, overallBudget);
  const grossProfit = calcGrossProfit(contractValue, totalActualCost);
  const grossMarginPct = calcGrossMarginPct(contractValue, totalActualCost);

  const categoryBreakdown = categories.map((cat) => ({
    categoryId: cat.id,
    categoryName: cat.name,
    budget: cat.budget,
    actualCost: cat.actual_cost || 0,
    remaining: cat.remaining_budget || 0,
    utilizationPct: cat.utilization_pct || 0,
    status: getBudgetHealth(cat.actual_cost || 0, cat.budget),
  }));

  return {
    projectId: project.id,
    projectName: project.name,
    clientName: project.client?.name || "Client",
    contractValue,
    collectedAmount,
    outstandingAmount,
    overallBudget,
    totalActualCost,
    remainingBudget,
    budgetUtilizationPct,
    grossProfit,
    grossMarginPct,
    status: project.status,
    categories: categoryBreakdown,
  };
});

export interface ExecutiveDashboardData {
  totalLeads: number;
  activeClients: number;
  activeProjects: number;
  totalPipeline: number;
  clientReceivables: number;
  collectedRevenue: number;
  projectCosts: number;
  grossProfit: number;
  grossMarginPct: number;
  budgetAlerts: Array<{
    projectName: string;
    categoryName: string;
    budget: number;
    actualCost: number;
    utilizationPct: number;
    status: "healthy" | "warning" | "at_limit" | "over_budget";
  }>;
  recentPayments: ClientPayment[];
  todayActivities: Activity[];
}

export const getExecutiveDashboardData = cache(async (): Promise<ExecutiveDashboardData> => {
  const [projects, leads, clients, payments, expenses, activities] = await Promise.all([
    getProjects(),
    getLeads(),
    getClients(),
    getClientPayments(),
    getExpenses(),
    getActivities(),
  ]);

  const totalLeads = leads.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const activeProjects = projects.filter((p) => p.status === "active").length;

  const totalPipeline = projects.reduce((sum, p) => sum + p.project_value, 0);
  const collectedRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const clientReceivables = Math.max(0, totalPipeline - collectedRevenue);

  const projectCosts = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const grossProfit = calcGrossProfit(totalPipeline, projectCosts);
  const grossMarginPct = calcGrossMarginPct(totalPipeline, projectCosts);

  // Budget Alerts (utilization >= 80%) — fetch all project categories concurrently in parallel
  const budgetAlerts: ExecutiveDashboardData["budgetAlerts"] = [];
  const projectCats = await Promise.all(
    projects.map((proj) => getProjectCategories(proj.id))
  );
  projects.forEach((proj, idx) => {
    const cats = projectCats[idx] || [];
    for (const c of cats) {
      if ((c.utilization_pct || 0) >= 80) {
        budgetAlerts.push({
          projectName: proj.name,
          categoryName: c.name,
          budget: c.budget,
          actualCost: c.actual_cost || 0,
          utilizationPct: c.utilization_pct || 0,
          status: getBudgetHealth(c.actual_cost || 0, c.budget),
        });
      }
    }
  });

  return {
    totalLeads,
    activeClients,
    activeProjects,
    totalPipeline,
    clientReceivables,
    collectedRevenue,
    projectCosts,
    grossProfit,
    grossMarginPct,
    budgetAlerts,
    recentPayments: payments.slice(0, 5),
    todayActivities: activities.slice(0, 5),
  };
});
