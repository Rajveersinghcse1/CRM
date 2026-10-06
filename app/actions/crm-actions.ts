"use server";

import {
  createLead,
  updateLead,
  deleteLead,
  convertLeadToClient,
  createCompany,
  updateCompany,
  deleteCompany,
  updateClient,
  deleteClient,
  createDeal,
  updateDeal,
  deleteDeal,
  updateDealStage,
  createProject,
  updateProject,
  deleteProject,
  createProjectCategory,
  updateProjectCategory,
  deleteProjectCategory,
  createExpense,
  updateExpense,
  deleteExpense,
  createVendorBill,
  updateVendorBill,
  deleteVendorBill,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  createClientPayment,
  updateClientPayment,
  deleteClientPayment,
  createTask,
  updateTask,
  deleteTask,
  createVendor,
  updateVendor,
  deleteVendor,
  createActivity,
  updateActivity,
  deleteActivity,
  saveProjectQuotation,
  uploadPdfToSupabaseStorage,
} from "@/lib/crm-db";
import { revalidatePath } from "next/cache";

export async function createLeadAction(data: any) {
  const result = await createLead(data);
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function convertLeadAction(leadId: string) {
  const result = await convertLeadToClient(leadId);
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function createCompanyAction(data: any) {
  const result = await createCompany(data);
  revalidatePath("/dashboard/companies");
  return result;
}

export async function createDealAction(data: any) {
  const result = await createDeal(data);
  revalidatePath("/dashboard/deals");
  return result;
}

export async function updateDealStageAction(dealId: string, stage: any) {
  const result = await updateDealStage(dealId, stage);
  revalidatePath("/dashboard/deals");
  return result;
}

export async function createProjectAction(data: any) {
  const result = await createProject(data);
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function createProjectCategoryAction(data: any) {
  const result = await createProjectCategory(data);
  if (data.project_id) {
    revalidatePath(`/dashboard/projects/${data.project_id}`);
  }
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function createExpenseAction(data: any) {
  const result = await createExpense(data);
  if (data.project_id) {
    revalidatePath(`/dashboard/projects/${data.project_id}`);
  }
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard/profitability");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function createVendorBillAction(data: any) {
  const result = await createVendorBill(data);
  revalidatePath("/dashboard/vendor-bills");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function createInvoiceAction(data: any, items?: any[]) {
  const result = await createInvoice(data, items);
  if (data.project_id) {
    revalidatePath(`/dashboard/projects/${data.project_id}`);
  }
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function createClientPaymentAction(data: any) {
  const result = await createClientPayment(data);
  if (data.project_id) {
    revalidatePath(`/dashboard/projects/${data.project_id}`);
  }
  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/profitability");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function createTaskAction(data: any) {
  const result = await createTask(data);
  if (data.project_id) {
    revalidatePath(`/dashboard/projects/${data.project_id}`);
  }
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function createVendorAction(data: any) {
  const result = await createVendor(data);
  revalidatePath("/dashboard/vendors");
  return result;
}

export async function updateVendorAction(id: string, data: any) {
  const result = await updateVendor(id, data);
  if (!result) throw new Error("Failed to update vendor: record not found.");
  revalidatePath("/dashboard/vendors");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteVendorAction(id: string) {
  const success = await deleteVendor(id);
  if (!success) throw new Error("Failed to delete vendor: record not found.");
  revalidatePath("/dashboard/vendors");
  revalidatePath("/dashboard/audit-logs");
}

export async function createActivityAction(data: any) {
  const result = await createActivity(data);
  revalidatePath("/dashboard/activities");
  revalidatePath("/dashboard/calendar");
  return result;
}

export async function updateActivityAction(id: string, data: any) {
  const result = await updateActivity(id, data);
  if (!result) throw new Error("Failed to update activity: record not found.");
  revalidatePath("/dashboard/activities");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteActivityAction(id: string) {
  const success = await deleteActivity(id);
  if (!success) throw new Error("Failed to delete activity: record not found.");
  revalidatePath("/dashboard/activities");
  revalidatePath("/dashboard/audit-logs");
}

// --- Update/Delete actions ---

export async function updateLeadAction(id: string, data: any) {
  const result = await updateLead(id, data);
  if (!result) throw new Error("Failed to update lead: record not found.");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteLeadAction(id: string) {
  const success = await deleteLead(id);
  if (!success) throw new Error("Failed to delete lead: record not found.");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/audit-logs");
}

export async function updateCompanyAction(id: string, data: any) {
  const result = await updateCompany(id, data);
  if (!result) throw new Error("Failed to update company: record not found.");
  revalidatePath("/dashboard/companies");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteCompanyAction(id: string) {
  const success = await deleteCompany(id);
  if (!success) throw new Error("Failed to delete company: record not found.");
  revalidatePath("/dashboard/companies");
  revalidatePath("/dashboard/audit-logs");
}

export async function updateDealAction(id: string, data: any) {
  const result = await updateDeal(id, data);
  if (!result) throw new Error("Failed to update deal: record not found.");
  revalidatePath("/dashboard/deals");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteDealAction(id: string) {
  const success = await deleteDeal(id);
  if (!success) throw new Error("Failed to delete deal: record not found.");
  revalidatePath("/dashboard/deals");
  revalidatePath("/dashboard/audit-logs");
}

export async function updateProjectAction(id: string, data: any) {
  const result = await updateProject(id, data);
  if (!result) throw new Error("Failed to update project: record not found.");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${id}`);
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteProjectAction(id: string) {
  const success = await deleteProject(id);
  if (!success) throw new Error("Failed to delete project: record not found.");
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/audit-logs");
}

export async function updateExpenseAction(id: string, data: any) {
  const result = await updateExpense(id, data);
  if (!result) throw new Error("Failed to update expense: record not found.");
  if (data.project_id) revalidatePath(`/dashboard/projects/${data.project_id}`);
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteExpenseAction(id: string, projectId?: string) {
  const success = await deleteExpense(id);
  if (!success) throw new Error("Failed to delete expense: record not found.");
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard/audit-logs");
}

export async function updateVendorBillAction(id: string, data: any) {
  const result = await updateVendorBill(id, data);
  if (!result) throw new Error("Failed to update vendor bill: record not found.");
  revalidatePath("/dashboard/vendor-bills");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteVendorBillAction(id: string) {
  const success = await deleteVendorBill(id);
  if (!success) throw new Error("Failed to delete vendor bill: record not found.");
  revalidatePath("/dashboard/vendor-bills");
  revalidatePath("/dashboard/audit-logs");
}

export async function updateTaskAction(id: string, data: any) {
  const result = await updateTask(id, data);
  if (!result) throw new Error("Failed to update task: record not found.");
  if (data.project_id) revalidatePath(`/dashboard/projects/${data.project_id}`);
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteTaskAction(id: string, projectId?: string) {
  const success = await deleteTask(id);
  if (!success) throw new Error("Failed to delete task: record not found.");
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/audit-logs");
}

export async function updateClientAction(id: string, data: any) {
  const result = await updateClient(id, data);
  if (!result) throw new Error("Failed to update client: record not found.");
  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${id}`);
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteClientAction(id: string) {
  const success = await deleteClient(id);
  if (!success) throw new Error("Failed to delete client: record not found.");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/audit-logs");
}

export async function updateInvoiceAction(id: string, data: any) {
  const result = await updateInvoice(id, data);
  if (!result) throw new Error("Failed to update invoice: record not found.");
  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${id}`);
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteInvoiceAction(id: string) {
  const success = await deleteInvoice(id);
  if (!success) throw new Error("Failed to delete invoice: record not found.");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/revenue");
  revalidatePath("/dashboard/audit-logs");
}

export async function updateProjectCategoryAction(id: string, data: any, projectId?: string) {
  const result = await updateProjectCategory(id, data);
  if (!result) throw new Error("Failed to update category: record not found.");
  const pId = projectId || data.project_id;
  if (pId) revalidatePath(`/dashboard/projects/${pId}`);
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteProjectCategoryAction(id: string, projectId?: string) {
  const success = await deleteProjectCategory(id);
  if (!success) throw new Error("Failed to delete category: record not found.");
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard/audit-logs");
}

export async function updateClientPaymentAction(id: string, data: any, projectId?: string) {
  const result = await updateClientPayment(id, data);
  if (!result) throw new Error("Failed to update payment: record not found.");
  const pId = projectId || data.project_id;
  if (pId) revalidatePath(`/dashboard/projects/${pId}`);
  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/revenue");
  revalidatePath("/dashboard/profitability");
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function deleteClientPaymentAction(id: string, projectId?: string) {
  const success = await deleteClientPayment(id);
  if (!success) throw new Error("Failed to delete payment: record not found.");
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/revenue");
  revalidatePath("/dashboard/profitability");
  revalidatePath("/dashboard/audit-logs");
}

export async function saveProjectQuotationAction(
  projectId: string,
  payload: {
    quotationNumber: string;
    quotationDate?: string;
    expiryDate?: string;
    data?: any;
    pdfUrl?: string | null;
  }
) {
  const result = await saveProjectQuotation(projectId, payload);
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}/quotation`);
  revalidatePath("/dashboard/audit-logs");
  return result;
}

export async function uploadQuotationPdfAction(
  projectId: string,
  formData: FormData
) {
  const file = formData.get("file") as File;
  const quotationNumber = (formData.get("quotationNumber") as string) || "quotation";
  if (!file) {
    throw new Error("No file provided");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const cleanNumber = quotationNumber.replace(/[\/\\]/g, "-");
  const fileName = `${cleanNumber}_${Date.now()}.pdf`;
  const storagePath = `${projectId}/${fileName}`;

  const publicUrl = await uploadPdfToSupabaseStorage("quotations", storagePath, buffer, "application/pdf");

  if (publicUrl) {
    await updateProject(projectId, {
      quotation_pdf_url: publicUrl,
      quotation_number: quotationNumber,
    });
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}/quotation`);
  return { publicUrl };
}

export async function uploadInvoicePdfAction(
  invoiceId: string,
  formData: FormData
) {
  const file = formData.get("file") as File;
  const invoiceNumber = (formData.get("invoiceNumber") as string) || "invoice";
  if (!file) {
    throw new Error("No file provided");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const cleanNumber = invoiceNumber.replace(/[\/\\]/g, "-");
  const fileName = `${cleanNumber}_${Date.now()}.pdf`;
  const storagePath = `${invoiceId}/${fileName}`;

  const publicUrl = await uploadPdfToSupabaseStorage("invoices", storagePath, buffer, "application/pdf");

  if (publicUrl) {
    await updateInvoice(invoiceId, {
      pdf_url: publicUrl,
      attachment_url: publicUrl,
    });
  }

  revalidatePath(`/dashboard/invoices`);
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return { publicUrl };
}


