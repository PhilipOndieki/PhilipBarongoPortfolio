export const STATUSES = [
  "new",
  "queued",
  "sent",
  "replied",
  "interested",
  "won",
  "not_interested",
  "skipped",
] as const;
export type LeadStatus = (typeof STATUSES)[number];

/** Statuses that count as "sent" for the conversion rates. */
export const SENT_STATUSES: readonly LeadStatus[] = [
  "sent",
  "replied",
  "interested",
  "won",
  "not_interested",
];

export const OUTCOMES: readonly { value: LeadStatus; label: string }[] = [
  { value: "sent", label: "Sent, no reply" },
  { value: "replied", label: "Replied" },
  { value: "interested", label: "Interested" },
  { value: "won", label: "Won" },
  { value: "not_interested", label: "Not interested" },
];

export interface Lead {
  id: string;
  slug: string;
  name: string;
  type: string | null;
  area: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  map_url: string | null;
  osm_id: string | null;
  message: string | null;
  status: LeadStatus;
  sort_order: number;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: number;
  interval_min: number;
  last_sent_at: string | null;
}

export interface Tap {
  id: number;
  slug: string;
  kind: "visit" | "contact";
  created_at: string;
}

export const LEAD_COLUMNS =
  "id,slug,name,type,area,city,phone,email,address,map_url,osm_id,message,status,sort_order,sent_at,created_at,updated_at";
