import { getProjectById, getProjects } from "@/lib/crm-db";
import { notFound } from "next/navigation";
import { QuotationDocument, QuotationData } from "@/components/quotation-document";

function getFinancialYear(dateStr?: string | null): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) {
    return "26-27";
  }
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  const startYear = month >= 4 ? year : year - 1;
  const endYear = startYear + 1;
  const sy = String(startYear).slice(-2);
  const ey = String(endYear).slice(-2);
  return `${sy}-${ey}`;
}

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

export default async function ProjectQuotationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ qno?: string }>;
}) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const [project, allProjects] = await Promise.all([
    getProjectById(id),
    getProjects(),
  ]);

  if (!project) {
    notFound();
  }

  // Derive Financial Year dynamically from project date
  const qDate = project.quotation_date || project.start_date || new Date().toISOString().split("T")[0];
  const fy = getFinancialYear(qDate);

  // Derive unique sequential sequence number project-to-project
  // Sorted by creation time so each project gets a permanent distinct sequence number
  const sortedProjects = [...allProjects].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const projectIndex = sortedProjects.findIndex((p) => p.id === project.id) + 1;

  let seqNum = "001";
  if (project.project_code) {
    const codeMatch = project.project_code.match(/\d+$/);
    seqNum = codeMatch ? codeMatch[0].padStart(3, "0") : String(projectIndex || 1).padStart(3, "0");
  } else {
    seqNum = String(projectIndex > 0 ? projectIndex : 1).padStart(3, "0");
  }

  // Auto-generate project-specific quotation number, with optional URL override or stored number
  const quotationNo = query.qno || project.quotation_number || `WXL/QO/${fy}/${seqNum}`;

  const eDate =
    project.quotation_expiry_date ||
    project.end_date ||
    new Date(new Date(qDate).getTime() + 30 * 86400000).toISOString().split("T")[0];

  const quotationDate = formatDateDMY(qDate);
  const expiryDate = formatDateDMY(eDate);
  const engagementStartDate = formatDateLong(qDate);
  const engagementEndDate = formatDateLong(eDate);

  // Client Bill To details
  const clientName = project.client?.name || "";
  const clientCompany = project.client?.company_name || "";
  const billToName =
    clientCompany && clientName
      ? `${clientCompany.toUpperCase()} & ${clientName.toUpperCase()}`
      : clientCompany.toUpperCase() || clientName.toUpperCase() || "BALAJI GROUP & DAKSH PRODUCTION";

  const contacts = [project.client?.phone, project.client?.alternate_phone]
    .filter(Boolean)
    .join(", ");
  const billToContact = contacts || "+91 83064 42969, +91 95710 76070";

  // Map Project categories to line items, or use standard services from quotation
  const hasCategories = project.categories && project.categories.length > 0;
  let items = [];

  if (hasCategories) {
    items = project.categories!.map((cat) => {
      const bullets =
        cat.subcategories && cat.subcategories.length > 0
          ? cat.subcategories.map((s) => s.name)
          : [
              `Comprehensive execution and management of ${cat.name}`,
              "Quality assurance and delivery checkpoints",
              "Bi-weekly status reporting and alignment",
            ];

      return {
        id: cat.id,
        title: cat.name,
        bullets,
        qty: "1 UOM",
        rate: cat.budget || 20000,
        amount: cat.budget || 20000,
      };
    });
  } else {
    // Exact standard marketing services from PDF
    items = [
      {
        id: "srv-1",
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
        rate: 20000,
        amount: 20000,
      },
      {
        id: "srv-2",
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
        rate: 20000,
        amount: 20000,
      },
      {
        id: "srv-3",
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
        rate: 20000,
        amount: 20000,
      },
    ];
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  // Detect Ad spend / Meta category from project categories
  const adCategory = project.categories?.find((c) =>
    /meta|ad|marketing|campaign|performance/i.test(c.name)
  );

  let metaAdsBudget = 0;
  if (adCategory) {
    metaAdsBudget = Number(adCategory.budget) || 0;
  } else if (!hasCategories) {
    metaAdsBudget = 20000;
  }

  const formatNumber = (num: number) => new Intl.NumberFormat("en-IN").format(num);

  // Dynamic Ad spend note
  const adSpendNote =
    metaAdsBudget > 0
      ? `Note: Meta Ads spend budget of ₹${formatNumber(metaAdsBudget)} is separate from the above service fee and will be utilised for running ads as agreed with the client.`
      : `Note: Any third-party platform licenses, domain/server fees, or ad spend are separate from the above service fee and will be billed as per actuals.`;

  // Dynamic GST note based on client profile
  const clientGst = project.client?.gst_number;
  const gstNote = clientGst
    ? `Client GSTIN: ${clientGst} · GST extra as applicable at statutory rates.`
    : "No GST applicable.";

  // Dynamic Terms & Conditions tailored specifically to this project & client
  const terms = [
    `This quotation is valid until the expiry date mentioned above (${expiryDate}).`,
    metaAdsBudget > 0
      ? `Meta Ads spend budget (₹${formatNumber(metaAdsBudget)}) is separate from the service fee and will be billed/utilised as per actual spend on the client's ad account.`
      : `Third-party media and platform spend (if any) is separate from the service fee and will be billed as per actual spend on the client's account.`,
    `Any services beyond the scope of ${project.name} mentioned above will be treated as additional work and charged separately, as mutually agreed.`,
    `Content and creative approvals must be provided within 48 hours of sharing; delays in approval may affect the shoot, posting, and campaign schedule.`,
    `Model coordination and shoot scheduling for ${project.name} will be planned in advance in consultation with ${billToName}.`,
    `All final creative assets (reels, posts, campaign creatives) become the property of ${billToName} upon full payment; Wexlogic IT Technologies reserves the right to showcase the work in its portfolio unless otherwise agreed in writing.`,
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

  const finalData: QuotationData = {
    ...initialData,
    ...(project.quotation_data || {}),
    quotationNo: query.qno || project.quotation_number || project.quotation_data?.quotationNo || quotationNo,
  };

  return (
    <QuotationDocument
      initialData={finalData}
      projectId={id}
      pdfUrl={project.quotation_pdf_url}
      backUrl={`/dashboard/projects/${id}`}
      backLabel="Back to Project"
    />
  );
}
