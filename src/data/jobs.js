export const JOBS = [
  {
    id: "job-001",
    status: "open", // open | closed | draft
    title: "Character goods banner designer",
    category: "Design",
    description:
      "Create a web + store banner set for a Japanese character goods drop. Need clean typography + strong character focus.",
    location: "Remote",
    reward: "Paid (negotiable)",
    tags: ["Banner", "Merch", "Branding"],
    apply: {
      type: "google_form",
      label: "Apply via Google Form",
      url: "https://forms.gle/REPLACE_WITH_YOUR_FORM",
    },
  },
  {
    id: "job-002",
    status: "open", // open | closed | draft
    title: "JP → EN licensing draft translator",
    category: "Translation",
    description:
      "Translate licensing / business drafts from Japanese to natural business English. Accuracy > speed.",
    location: "Remote",
    reward: "Paid per document",
    tags: ["Legal", "Business", "JP→EN"],
    apply: {
      type: "dm",
      label: "Apply via DM",
      url: "https://x.com/messages/compose?recipient_id=REPLACE_WITH_YOUR_ID",
    },
  },
  {
    id: "job-003",
    status: "open", // open | closed | draft
    title: "Event staff for anime pop-up weekend",
    category: "Event",
    description:
      "Help operate a weekend pop-up: queue control, POS support, light customer assistance.",
    location: "On-site",
    reward: "Hourly + bonus",
    tags: ["Retail", "Event", "Weekend"],
    apply: {
      type: "usdc",
      label: "Apply + pay deposit in USDC",
      chain: "Base",
      token: "USDC",
      amount: "10",
      payToAddress: "0xREPLACE_WITH_YOUR_RECEIVE_ADDRESS",
      memo: "ADLAB_JOB_003_DEPOSIT",
    },
  },
]
