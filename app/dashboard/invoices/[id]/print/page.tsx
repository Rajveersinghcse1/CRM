import { getInvoiceById } from "@/lib/crm-db";
import { notFound } from "next/navigation";
import { QuotationDocument, QuotationData } from "@/components/quotation-document";

function formatDateDMY(dateStr?: string | null): string {
  if (!dateStr) {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatDateLong(dateStr?: string | null): string {
  if (!dateStr) return "14 September 2026";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  const quotationNo = invoice.invoice_number || "WXL/QO/26-27/005";
  const quotationDate = formatDateDMY(invoice.issue_date);
  const expiryDate = formatDateDMY(invoice.due_date);
  const engagementStartDate = formatDateLong(invoice.issue_date);
  const engagementEndDate = formatDateLong(invoice.due_date);

  const clientName = invoice.client?.name || "";
  const clientCompany = invoice.client?.company_name || "";
  const billToName =
    clientCompany && clientName
      ? `${clientCompany.toUpperCase()} & ${clientName.toUpperCase()}`
      : clientCompany.toUpperCase() || clientName.toUpperCase() || "BALAJI GROUP & DAKSH PRODUCTION";

  const contacts = [invoice.client?.phone, invoice.client?.alternate_phone]
    .filter(Boolean)
    .join(", ");
  const billToContact = contacts || "+91 83064 42969, +91 95710 76070";

  let items = [];
  if (invoice.items && invoice.items.length > 0) {
    items = invoice.items.map((it, idx) => ({
      id: it.id || `inv-item-${idx}`,
      title: it.description,
      bullets: [
        "Professional service execution and delivery",
        "Deliverables reviewed and approved as per statement of work",
      ],
      qty: `${it.quantity} UOM`,
      rate: it.unit_price,
      amount: it.amount,
    }));
  } else {
    items = [
      {
        id: "inv-item-1",
        title: "Social Media Marketing & Content Creation",
        bullets: [
          "20 Reel Shoots with Female Model per month",
          "20 Instagram Posts per month",
          "Professional Female Model Coordination & Styling",
          "On-Location / Studio Shoot Planning",
          "Creative Concept & Storyboarding for Reels",
          "Editing & Post-Production (Reels + Posts)",
          "Trend-Based Content Ideas for Higher Reach",
          "Caption Writing & Hashtag Strategy",
          "Content Calendar & Posting Schedule",
          "Monthly Performance Insights & Growth Report",
        ],
        qty: "1 UOM",
        rate: invoice.total ? invoice.total / 3 : 20000,
        amount: invoice.total ? invoice.total / 3 : 20000,
      },
      {
        id: "inv-item-2",
        title: "Influencer Marketing & Brand Collaboration",
        bullets: [
          "15 Influencers — Mix of Mid-Level & Beginner/Nano Female Influencers",
          "Brand Collaboration Coordination",
          "Static Post & Reel Content as per Number of Brand Sponsorships",
          "Influencer Shortlisting Based on Brand Fit",
          "Rate Negotiation & Deal Finalisation",
          "Content Briefing & Usage Rights Coordination",
          "Performance Tracking & Reporting of Influencer Content",
          "Long-Term Influencer Relationship Building",
        ],
        qty: "1 UOM",
        rate: invoice.total ? invoice.total / 3 : 20000,
        amount: invoice.total ? invoice.total / 3 : 20000,
      },
      {
        id: "inv-item-3",
        title: "Performance Marketing (Meta Ads)",
        bullets: [
          "3 Ad Campaign Slots",
          "Meta Ads Campaign Management (Ad Spend Budget: ₹20,000 — separate, billed as per actual spend)",
          "Audience Research & Targeting Strategy",
          "Ad Creative Strategy & A/B Testing",
          "Daily Campaign Monitoring & Optimization",
          "Retargeting & Remarketing Setup",
          "Weekly/Monthly Performance & ROI Report",
        ],
        qty: "1 UOM",
        rate: invoice.total ? invoice.total / 3 : 20000,
        amount: invoice.total ? invoice.total / 3 : 20000,
      },
    ];
  }

  const total = invoice.total || items.reduce((sum, item) => sum + item.amount, 0);

  // Check if any line items relate to Meta Ads
  const adItem = items.find((it) => /meta|ad|marketing|campaign/i.test(it.title));
  const metaAdsBudget = adItem ? adItem.amount : 0;
  const formatNumber = (num: number) => new Intl.NumberFormat("en-IN").format(num);

  const adSpendNote =
    metaAdsBudget > 0
      ? `Note: Meta Ads spend budget of ₹${formatNumber(metaAdsBudget)} is separate from the above service fee and will be utilised for running ads as agreed with the client.`
      : `Note: Third-party platform and external services are billed separately as agreed with the client.`;

  const clientGst = invoice.client?.gst_number;
  const gstNote = clientGst
    ? `Client GSTIN: ${clientGst} · GST extra as applicable at statutory rates.`
    : "No GST applicable.";

  const terms = [
    `This quotation / invoice is valid until the due date mentioned above (${expiryDate}).`,
    metaAdsBudget > 0
      ? `Meta Ads spend budget (₹${formatNumber(metaAdsBudget)}) is separate from the service fee and will be billed/utilised as per actual spend on the client's ad account.`
      : `Any third-party media and platform spend is separate from the service fee and will be billed as per actual spend on the client's account.`,
    `Any services beyond the scope mentioned above will be treated as additional work and charged separately, as mutually agreed.`,
    `Content and creative approvals must be provided within 48 hours of sharing; delays in approval may affect the shoot, posting, and campaign schedule.`,
    `Model coordination and shoot scheduling will be planned in advance in consultation with ${billToName}.`,
    `All final creative assets become the property of ${billToName} upon full payment; Wexlogic IT Technologies reserves the right to showcase the work in its portfolio unless otherwise agreed in writing.`,
    `Results from influencer marketing and performance marketing depend on market conditions, influencer availability, and platform algorithms, and cannot be guaranteed in absolute terms.`,
    `Ongoing services may be discontinued by either party with 15 days' written notice.`,
    `Any disputes arising from this agreement shall be subject to the jurisdiction of Jodhpur, Rajasthan.`,
  ];

  const initialData: QuotationData = {
    quotationNo,
    quotationDate,
    expiryDate,
    companyName: "WEXLOGIC IT TECHNOLOGIES",
    companyAddress: "Jodhpur, Rajasthan",
    companyMobile: "7737297548",
    billToName,
    billToContact,
    items,
    total,
    accountHolderName: "Tushar Parihar",
    accountNumber: "43380377020",
    ifscCode: "SBIN0032167",
    branch: "Jodhpur Circuit House",
    upiId: "parihartushar4@oksbi",
    gstNote,
    adSpendNote,
    metaAdsBudget,
    advancePct: 50,
    remainingDays: 10,
    engagementStartDate,
    engagementEndDate,
    terms,
  };

  return (
    <QuotationDocument
      initialData={initialData}
      backUrl="/dashboard/invoices"
      backLabel="Back to Invoices"
    />
  );
}
