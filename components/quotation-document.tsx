"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Edit3,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Save,
  UploadCloud,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { numberToIndianWords } from "@/utils/finance-calc";
import {
  saveProjectQuotationAction,
  uploadQuotationPdfAction,
} from "@/app/actions/crm-actions";

export interface QuotationServiceItem {
  id: string;
  title: string;
  bullets: string[];
  qty: string;
  rate: number;
  amount: number;
}

export interface QuotationData {
  quotationNo: string;
  quotationDate: string;
  expiryDate: string;
  companyName: string;
  companyAddress: string;
  companyMobile: string;
  billToName: string;
  billToContact: string;
  items: QuotationServiceItem[];
  total: number;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId: string;
  gstNote: string;
  adSpendNote: string;
  metaAdsBudget: number;
  advancePct: number;
  remainingDays: number;
  engagementStartDate: string;
  engagementEndDate: string;
  terms: string[];
}

export function QuotationDocument({
  initialData,
  projectId,
  pdfUrl,
  backUrl = "/dashboard/invoices",
  backLabel = "Back",
}: {
  initialData: QuotationData;
  projectId?: string;
  pdfUrl?: string | null;
  backUrl?: string;
  backLabel?: string;
}) {
  const [data, setData] = useState<QuotationData>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(pdfUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateTotal = (items: QuotationServiceItem[]) => {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const handleItemChange = (
    index: number,
    field: keyof QuotationServiceItem,
    value: string | number | string[]
  ) => {
    const updated = [...data.items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "rate" || field === "qty") {
      const rate = Number(field === "rate" ? value : updated[index].rate) || 0;
      updated[index].amount = rate;
    }
    const newTotal = calculateTotal(updated);
    setData((prev) => ({
      ...prev,
      items: updated,
      total: newTotal,
    }));
  };

  const handleAddBullet = (itemIndex: number) => {
    const updated = [...data.items];
    updated[itemIndex].bullets = [...updated[itemIndex].bullets, "New service deliverable"];
    setData((prev) => ({ ...prev, items: updated }));
  };

  const handleRemoveBullet = (itemIndex: number, bulletIndex: number) => {
    const updated = [...data.items];
    updated[itemIndex].bullets = updated[itemIndex].bullets.filter((_, idx) => idx !== bulletIndex);
    setData((prev) => ({ ...prev, items: updated }));
  };

  const handleUpdateBullet = (itemIndex: number, bulletIndex: number, text: string) => {
    const updated = [...data.items];
    const newBullets = [...updated[itemIndex].bullets];
    newBullets[bulletIndex] = text;
    updated[itemIndex].bullets = newBullets;
    setData((prev) => ({ ...prev, items: updated }));
  };

  const handleAddItem = () => {
    const newItem: QuotationServiceItem = {
      id: crypto.randomUUID(),
      title: "New Marketing Service",
      bullets: ["Deliverable specification or campaign requirement"],
      qty: "1 UOM",
      rate: 10000,
      amount: 10000,
    };
    const updated = [...data.items, newItem];
    setData((prev) => ({
      ...prev,
      items: updated,
      total: calculateTotal(updated),
    }));
  };

  const handleRemoveItem = (index: number) => {
    const updated = data.items.filter((_, idx) => idx !== index);
    setData((prev) => ({
      ...prev,
      items: updated,
      total: calculateTotal(updated),
    }));
  };

  const handleReset = () => {
    setData(initialData);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const amountInWords = numberToIndianWords(data.total);

  const handlePrint = () => {
    const originalTitle = document.title;
    // Set clean filename for PDF download (e.g. WXL-QO-26-27-001_Quotation.pdf)
    document.title = data.quotationNo
      ? `${data.quotationNo.replace(/[\/\\]/g, "-")}_Quotation`
      : "Quotation";
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const handleSaveToDatabase = async () => {
    if (!projectId) return;
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await saveProjectQuotationAction(projectId, {
        quotationNumber: data.quotationNo,
        quotationDate: data.quotationDate,
        expiryDate: data.expiryDate,
        data: data,
        pdfUrl: currentPdfUrl,
      });
      setSaveStatus("Saved to Supabase DB!");
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      setSaveStatus("Save failed: " + (err?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    setIsUploading(true);
    setSaveStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quotationNumber", data.quotationNo);
      const res = await uploadQuotationPdfAction(projectId, formData);
      if (res?.publicUrl) {
        setCurrentPdfUrl(res.publicUrl);
        setSaveStatus("PDF saved to Supabase Storage!");
      }
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus("Upload failed: " + (err?.message || "Unknown error"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-16 print:bg-white print:pb-0 print:m-0">
      {/* Top Floating Control Bar (Hidden on Print) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-300 px-4 py-3 shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={backUrl}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Quotation Preview
              </span>
              <h1 className="text-sm font-black text-slate-900">{data.quotationNo}</h1>
            </div>
            {saveStatus && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md animate-pulse">
                {saveStatus}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {currentPdfUrl && (
              <a
                href={currentPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-sm"
                title="View PDF stored in Supabase Storage"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Supabase PDF
              </a>
            )}

            {projectId && (
              <>
                <button
                  type="button"
                  onClick={handleSaveToDatabase}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                  title="Save quotation details to Supabase Database"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {isSaving ? "Saving..." : "Save to DB"}
                </button>

                <input
                  type="file"
                  accept="application/pdf"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                  title="Upload PDF directly to Supabase Storage bucket"
                >
                  {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                  {isUploading ? "Uploading..." : "Upload PDF"}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                isEditing
                  ? "bg-amber-100 border-amber-400 text-amber-900"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              {isEditing ? "Hide Editor" : "Edit Fields"}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleReset}
                title="Reset to original project data"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-1.5 text-xs font-black text-white hover:bg-slate-800 transition shadow-sm cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Download / Print PDF
            </button>
          </div>
        </div>

        {/* Live Edit Drawer */}
        {isEditing && (
          <div className="max-w-5xl mx-auto mt-4 p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Quick Document Editor
              </span>
              <span className="text-[11px] text-slate-500">
                Changes update the preview instantly & will be preserved on PDF export
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Quotation No.
                </label>
                <input
                  type="text"
                  value={data.quotationNo}
                  onChange={(e) => setData({ ...data, quotationNo: e.target.value })}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded p-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Quotation Date
                </label>
                <input
                  type="text"
                  value={data.quotationDate}
                  onChange={(e) => setData({ ...data, quotationDate: e.target.value })}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded p-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={data.expiryDate}
                  onChange={(e) => setData({ ...data, expiryDate: e.target.value })}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded p-1.5 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Bill To (Client / Company Name)
                </label>
                <input
                  type="text"
                  value={data.billToName}
                  onChange={(e) => setData({ ...data, billToName: e.target.value })}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded p-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Contact Number(s)
                </label>
                <input
                  type="text"
                  value={data.billToContact}
                  onChange={(e) => setData({ ...data, billToContact: e.target.value })}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded p-1.5 text-slate-900"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  Line Items ({data.items.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add Service
                </button>
              </div>

              <div className="space-y-3">
                {data.items.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                        placeholder="Service Category Title"
                        className="flex-1 text-xs font-bold text-slate-900 border border-slate-300 rounded p-1"
                      />
                      <input
                        type="text"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                        placeholder="1 UOM"
                        className="w-20 text-xs text-center border border-slate-300 rounded p-1"
                      />
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, "rate", Number(e.target.value))}
                        placeholder="Rate"
                        className="w-24 text-xs text-right border border-slate-300 rounded p-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                        title="Remove service row"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="pl-7 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          Bullet Deliverables
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddBullet(idx)}
                          className="text-[10px] font-bold text-blue-600 hover:underline"
                        >
                          + Add Bullet
                        </button>
                      </div>
                      {item.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-xs">•</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => handleUpdateBullet(idx, bIdx, e.target.value)}
                            className="flex-1 text-[11px] text-slate-700 border border-slate-200 rounded px-1.5 py-0.5"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBullet(idx, bIdx)}
                            className="text-slate-400 hover:text-rose-600 text-xs px-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200 pt-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Engagement Period Dates
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={data.engagementStartDate}
                    onChange={(e) => setData({ ...data, engagementStartDate: e.target.value })}
                    placeholder="14 September 2026"
                    className="w-1/2 text-xs border border-slate-300 rounded p-1.5"
                  />
                  <span className="text-xs text-slate-400 self-center">to</span>
                  <input
                    type="text"
                    value={data.engagementEndDate}
                    onChange={(e) => setData({ ...data, engagementEndDate: e.target.value })}
                    placeholder="17 October 2026"
                    className="w-1/2 text-xs border border-slate-300 rounded p-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Ad Spend Budget (₹)
                </label>
                <input
                  type="number"
                  value={data.metaAdsBudget}
                  onChange={(e) => setData({ ...data, metaAdsBudget: Number(e.target.value) || 0 })}
                  className="w-full text-xs border border-slate-300 rounded p-1.5"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Quotation Sheet (Exact recreation of PDF) */}
      <main className="max-w-[794px] mx-auto mt-6 bg-white shadow-xl print:shadow-none print:mt-0 print:max-w-none">
        {/* ================= PAGE 1 ================= */}
        <section className="p-8 sm:p-12 print:p-0 min-h-[1100px] flex flex-col justify-between page-sheet page-break">
          <div>
            {/* Top Logo & Quotation Heading */}
            <div className="flex flex-col items-start">
              {/* Official Wexlogic Black Logo */}
              <div className="h-12 w-auto flex items-center">
                <img
                  src="/logo-black.png"
                  alt="Wexlogic IT Technologies"
                  className="h-12 w-auto object-contain"
                />
              </div>

              {/* Quotation Big Title */}
              <h1 className="mt-5 text-[26px] font-black uppercase tracking-[0.1em] text-[#111827]">
                QUOTATION
              </h1>
            </div>

            {/* Golden Horizontal Bar (Matching PDF) */}
            <div className="w-full h-[3.5px] bg-[#CCA352] mt-3.5 mb-3" />

            {/* Header Metadata Grid */}
            <div className="flex justify-between items-start text-xs">
              {/* Left Column: Wexlogic info */}
              <div className="space-y-0.5">
                <p className="font-bold uppercase tracking-tight text-gray-900 text-[13px]">
                  {data.companyName}
                </p>
                <p className="text-gray-700 text-xs">{data.companyAddress}</p>
                <p className="text-gray-700 text-xs">Mobile: {data.companyMobile}</p>
              </div>

              {/* Right Column: Quotation No & Dates */}
              <div className="text-right space-y-0.5 text-xs">
                <p className="text-gray-900">
                  <span className="font-bold">Quotation No.:</span> {data.quotationNo}
                </p>
                <p className="text-gray-900">
                  <span className="font-bold">Quotation Date:</span> {data.quotationDate}
                </p>
                <p className="text-gray-900">
                  <span className="font-bold">Expiry Date:</span> {data.expiryDate}
                </p>
              </div>
            </div>

            {/* BILL TO Box (Matching PDF) */}
            <div className="my-4 bg-[#F8F5EC] p-3 sm:p-3.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#A17A20]">
                BILL TO
              </span>
              <p className="text-sm font-black uppercase text-gray-950 mt-0.5">
                {data.billToName}
              </p>
              <p className="text-xs font-semibold text-gray-800 mt-0.5">
                Contact: {data.billToContact}
              </p>
            </div>

            {/* SERVICES TABLE (Pixel-perfect recreation) */}
            <div className="mt-4 border border-gray-300">
              <table className="w-full border-collapse text-left">
                {/* Black Header Row */}
                <thead>
                  <tr className="bg-black text-white text-[10px] font-black uppercase tracking-wider">
                    <th className="py-2.5 pl-3 w-[7%] text-left">S.NO.</th>
                    <th className="py-2.5 pl-3 w-[57%] text-left">SERVICES</th>
                    <th className="py-2.5 text-center w-[12%]">QTY.</th>
                    <th className="py-2.5 text-center w-[12%]">RATE</th>
                    <th className="py-2.5 text-center w-[12%]">AMOUNT</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-300">
                  {data.items.map((item, index) => (
                    <tr key={item.id} className="align-top">
                      {/* S.NO */}
                      <td className="py-3 pl-3 text-xs font-bold text-gray-900 border-r border-gray-300">
                        {index + 1}
                      </td>

                      {/* SERVICES (Golden Title + Bullets) */}
                      <td className="py-3 px-3 border-r border-gray-300">
                        <p className="text-[12.5px] font-black text-[#A17A20] leading-snug mb-1.5">
                          {item.title}
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10.5px] leading-relaxed text-gray-800 font-medium">
                          {item.bullets.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      </td>

                      {/* QTY */}
                      <td className="py-3 text-center text-xs font-medium text-gray-800 border-r border-gray-300 whitespace-nowrap">
                        {item.qty}
                      </td>

                      {/* RATE */}
                      <td className="py-3 text-center text-xs font-medium text-gray-800 border-r border-gray-300 whitespace-nowrap">
                        {formatNumber(item.rate)}
                      </td>

                      {/* AMOUNT */}
                      <td className="py-3 text-center text-xs font-medium text-gray-800 whitespace-nowrap">
                        {formatNumber(item.amount)}
                      </td>
                    </tr>
                  ))}

                  {/* TOTAL ROW (Beige Cream Background) */}
                  <tr className="bg-[#F8F5EC] border-t-2 border-gray-300">
                    <td colSpan={4} className="py-2.5 pr-4 text-right border-r border-gray-300">
                      <span className="text-xs font-black uppercase tracking-wider text-gray-950">
                        TOTAL
                      </span>
                    </td>
                    <td className="py-2.5 text-center whitespace-nowrap">
                      <span className="text-xs font-black text-[#A17A20]">
                        ₹ {formatNumber(data.total)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Page Break Separator (Hidden on Print) */}
        <div className="print:hidden border-t-4 border-dashed border-slate-300 bg-slate-200 py-3 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">
            Page Break — Below is Page 2
          </span>
        </div>

        {/* ================= PAGE 2 ================= */}
        <section className="p-8 sm:p-12 print:p-0 min-h-[1100px] flex flex-col justify-between page-sheet">
          <div className="space-y-4">
            {/* Section 1: PAYMENT DETAILS */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#A17A20] mb-2">
                PAYMENT DETAILS
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* Bank Account Info Card (Left 2 cols) */}
                <div className="sm:col-span-2 bg-[#F8F5EC] p-3 text-xs space-y-1 text-gray-900 border border-[#EBE5D6]">
                  <p>
                    <span className="font-bold">Account Holder Name:</span> {data.accountHolderName}
                  </p>
                  <p>
                    <span className="font-bold">Account Number:</span> {data.accountNumber}
                  </p>
                  <p>
                    <span className="font-bold">IFSC Code:</span> {data.ifscCode}
                  </p>
                  <p>
                    <span className="font-bold">Branch:</span> {data.branch}
                  </p>
                  <p>
                    <span className="font-bold">UPI ID:</span> {data.upiId}
                  </p>
                </div>

                {/* QR Code (Right 1 col) */}
                <div className="flex flex-col items-center justify-center">
                  <div className="p-1 border border-gray-300 bg-white">
                    <img
                      src={
                        data.upiId === "parihartushar4@oksbi"
                          ? "/upi-qr.png"
                          : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                              `upi://pay?pa=${data.upiId}&pn=${encodeURIComponent(
                                data.accountHolderName
                              )}&cu=INR`
                            )}`
                      }
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                          `upi://pay?pa=${data.upiId}&pn=${encodeURIComponent(
                            data.accountHolderName
                          )}&cu=INR`
                        )}`;
                      }}
                      alt="Scan to Pay QR"
                      className="h-24 w-24 object-contain"
                    />
                  </div>
                  <span className="text-[10px] italic text-gray-600 mt-1 font-medium">
                    Scan to Pay
                  </span>
                </div>
              </div>

              {/* Amount in words & Notes */}
              <div className="mt-3 text-xs space-y-0.5">
                <p className="text-gray-900 font-bold">
                  Total Amount (in words):{" "}
                  <span className="font-semibold">{amountInWords}</span>
                </p>
                <p className="text-[11px] italic text-gray-600">{data.gstNote}</p>
                {data.adSpendNote && (
                  <p className="text-[10.5px] italic text-gray-600 leading-snug">
                    {data.adSpendNote}
                  </p>
                )}
              </div>
            </div>

            {/* Section 2: PAYMENT TERMS */}
            <div className="pt-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#A17A20] mb-1.5">
                PAYMENT TERMS
              </h2>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-800">
                <li>
                  {data.advancePct}% advance payment to be made before commencement of work.
                </li>
                <li>
                  Remaining {100 - data.advancePct}% payment to be made within {data.remainingDays}{" "}
                  days of project start.
                </li>
              </ul>
            </div>

            {/* Section 3: ENGAGEMENT PERIOD */}
            <div className="pt-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#A17A20] mb-1.5">
                ENGAGEMENT PERIOD
              </h2>
              <p className="text-[11px] text-gray-800 leading-relaxed">
                This engagement runs from {data.engagementStartDate} to {data.engagementEndDate},{" "}
                allowing sufficient time to plan, produce, and execute the content and campaigns
                outlined above.
              </p>
            </div>

            {/* Section 4: TERMS & CONDITIONS */}
            <div className="pt-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#A17A20] mb-2">
                TERMS & CONDITIONS
              </h2>
              <ol className="list-decimal pl-4 space-y-1.5 text-[10.5px] text-gray-800 leading-normal">
                {data.terms && data.terms.length > 0 ? (
                  data.terms.map((term, tIdx) => (
                    <li key={tIdx}>{term}</li>
                  ))
                ) : (
                  <>
                    <li>This quotation is valid until the expiry date mentioned above.</li>
                    <li>
                      Meta Ads spend budget (₹{formatNumber(data.metaAdsBudget)}) is separate from the
                      service fee and will be billed/utilised as per actual spend on the client&apos;s
                      ad account.
                    </li>
                    <li>
                      Any services beyond the scope mentioned above will be treated as additional work
                      and charged separately, as mutually agreed.
                    </li>
                    <li>
                      Content and creative approvals must be provided within 48 hours of sharing; delays
                      in approval may affect the shoot, posting, and campaign schedule.
                    </li>
                    <li>
                      Model coordination and shoot scheduling will be planned in advance in consultation
                      with the client.
                    </li>
                    <li>
                      All final creative assets (reels, posts, campaign creatives) become the property of
                      the client upon full payment; Wexlogic IT Technologies reserves the right to
                      showcase the work in its portfolio unless otherwise agreed in writing.
                    </li>
                    <li>
                      Results from influencer marketing and performance marketing depend on market
                      conditions, influencer availability, and platform algorithms, and cannot be
                      guaranteed in absolute terms.
                    </li>
                    <li>
                      Ongoing services may be discontinued by either party with 15 days&apos; written
                      notice.
                    </li>
                    <li>
                      Any disputes arising from this agreement shall be subject to the jurisdiction of
                      Jodhpur, Rajasthan.
                    </li>
                  </>
                )}
              </ol>
            </div>
          </div>
        </section>
      </main>

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important; /* Strips browser URL, date/time, and title headers */
          }
          html,
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .page-break {
            break-after: page !important;
            page-break-after: always !important;
          }
          .page-sheet {
            box-sizing: border-box !important;
            width: 210mm !important;
            min-height: 297mm !important;
            max-width: 210mm !important;
            padding: 14mm 16mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
