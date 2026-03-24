export type MockUser = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  email_verified: boolean;
  roles: string[];
  account_id: string;
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  tone: "neutral" | "positive" | "warning";
};

export type DeliveryPoint = {
  day: string;
  delivered: number;
  read: number;
  failed: number;
};

export type FunnelPoint = {
  label: string;
  value: number;
};

export type CampaignRow = {
  id: number;
  name: string;
  template: string;
  audience: string;
  owner: string;
  status: "Live" | "Scheduled" | "Draft" | "Completed";
  sent: number;
  delivered: number;
  replies: number;
  spend: number;
  scheduledAt: string;
};

export type TemplateRow = {
  id: number;
  name: string;
  category: "Marketing" | "Utility" | "Authentication";
  language: string;
  status: "Approved" | "Needs Review";
  quality: "High" | "Medium";
  updatedAt: string;
  preview: string;
  variables: number;
};

export type ThreadMessage = {
  id: number;
  sender: "customer" | "agent" | "system";
  text: string;
  time: string;
};

export type InboxThread = {
  id: number;
  customerName: string;
  phone: string;
  segment: string;
  assignedTo: string;
  status: "Live" | "Waiting" | "Resolved";
  lastSeen: string;
  unread: number;
  satisfaction: string;
  lastMessage: string;
  notes: string;
  messages: ThreadMessage[];
};

export type TeamMember = {
  id: number;
  name: string;
  role: string;
  queue: string;
  phone: string;
  email: string;
  status: "Online" | "Break" | "Offline";
  conversations: number;
  resolutionRate: string;
  shift: string;
  lastActive: string;
};

export type ContactSegment = {
  id: string;
  label: string;
  contacts: number;
};

export const mockUser: MockUser = {
  id: 1,
  full_name: "Rahul Sharma",
  email: "rahul.sharma@pulseadmin.in",
  phone: "+91 98765 43210",
  status: "active",
  role: "Operations Lead",
  email_verified: true,
  roles: ["admin"],
  account_id: "ACC-IN-2091",
};

export const dashboardMetrics: DashboardMetric[] = [
  {
    id: "campaigns",
    label: "Active campaigns",
    value: "18",
    delta: "+3 this week",
    tone: "positive",
  },
  {
    id: "delivery",
    label: "Delivery rate",
    value: "97.8%",
    delta: "+1.4% vs last week",
    tone: "positive",
  },
  {
    id: "messages",
    label: "Messages today",
    value: "24,860",
    delta: "Peak at 11:30 AM",
    tone: "neutral",
  },
  {
    id: "response",
    label: "Avg. first response",
    value: "2m 14s",
    delta: "-18s improvement",
    tone: "positive",
  },
];

export const deliveryTrend: DeliveryPoint[] = [
  { day: "Mon", delivered: 3200, read: 2450, failed: 62 },
  { day: "Tue", delivered: 3620, read: 2810, failed: 55 },
  { day: "Wed", delivered: 4050, read: 3085, failed: 49 },
  { day: "Thu", delivered: 3890, read: 3004, failed: 58 },
  { day: "Fri", delivered: 4410, read: 3460, failed: 44 },
  { day: "Sat", delivered: 3950, read: 3140, failed: 47 },
  { day: "Sun", delivered: 2840, read: 2120, failed: 39 },
];

export const funnelData: FunnelPoint[] = [
  { label: "Queued", value: 4120 },
  { label: "Delivered", value: 3986 },
  { label: "Read", value: 3324 },
  { label: "Clicked", value: 1265 },
];

export const campaignRows: CampaignRow[] = [
  {
    id: 1,
    name: "Festive Repeat Purchase",
    template: "festive_offer_hi",
    audience: "Recent Buyers",
    owner: "Priya Verma",
    status: "Live",
    sent: 5600,
    delivered: 5484,
    replies: 384,
    spend: 6720,
    scheduledAt: "24 Mar, 09:15 AM",
  },
  {
    id: 2,
    name: "Abandoned Cart Reminder",
    template: "cart_recovery_v2",
    audience: "Cart Drop-offs",
    owner: "Rahul Sharma",
    status: "Live",
    sent: 4210,
    delivered: 4132,
    replies: 295,
    spend: 5052,
    scheduledAt: "24 Mar, 10:30 AM",
  },
  {
    id: 3,
    name: "Store Visit Invitation",
    template: "store_visit_invite",
    audience: "Bengaluru Leads",
    owner: "Neha Iyer",
    status: "Scheduled",
    sent: 0,
    delivered: 0,
    replies: 0,
    spend: 0,
    scheduledAt: "24 Mar, 04:00 PM",
  },
  {
    id: 4,
    name: "Order Confirmation Follow-up",
    template: "utility_followup",
    audience: "Yesterday Orders",
    owner: "Amit Joshi",
    status: "Completed",
    sent: 2960,
    delivered: 2918,
    replies: 121,
    spend: 3552,
    scheduledAt: "23 Mar, 07:45 PM",
  },
  {
    id: 5,
    name: "VIP Preview Access",
    template: "vip_early_access",
    audience: "Gold Members",
    owner: "Simran Kaur",
    status: "Draft",
    sent: 0,
    delivered: 0,
    replies: 0,
    spend: 0,
    scheduledAt: "Awaiting approval",
  },
];

export const templateRows: TemplateRow[] = [
  {
    id: 1,
    name: "festive_offer_hi",
    category: "Marketing",
    language: "Hindi",
    status: "Approved",
    quality: "High",
    updatedAt: "24 Mar, 08:40 AM",
    preview:
      "Namaste {{1}}, festive weekend offer live hai. Aaj order karein aur instant cashback payein.",
    variables: 1,
  },
  {
    id: 2,
    name: "cart_recovery_v2",
    category: "Utility",
    language: "English",
    status: "Approved",
    quality: "High",
    updatedAt: "23 Mar, 06:10 PM",
    preview:
      "Hi {{1}}, your cart is still active. Complete checkout before midnight to lock the current price.",
    variables: 1,
  },
  {
    id: 3,
    name: "auth_otp_login",
    category: "Authentication",
    language: "English",
    status: "Approved",
    quality: "High",
    updatedAt: "22 Mar, 11:20 AM",
    preview: "Your Pulse Admin verification code is {{1}}. It expires in 10 minutes.",
    variables: 1,
  },
  {
    id: 4,
    name: "vip_early_access",
    category: "Marketing",
    language: "English",
    status: "Needs Review",
    quality: "Medium",
    updatedAt: "21 Mar, 03:05 PM",
    preview:
      "Hello {{1}}, your early-access link for the private collection is ready. Tap below to preview.",
    variables: 1,
  },
];

export const inboxThreads: InboxThread[] = [
  {
    id: 1,
    customerName: "Priya Nair",
    phone: "+91 99880 11234",
    segment: "VIP Buyers",
    assignedTo: "Ananya Rao",
    status: "Live",
    lastSeen: "2 min ago",
    unread: 2,
    satisfaction: "High intent",
    lastMessage: "Can you share delivery timeline for the blue variant?",
    notes: "Repeat buyer from Kochi. Prefers afternoon delivery slots.",
    messages: [
      { id: 1, sender: "customer", text: "Hi, is the blue variant available in medium?", time: "11:02 AM" },
      { id: 2, sender: "agent", text: "Yes Priya, medium is available. I can reserve one for today.", time: "11:05 AM" },
      { id: 3, sender: "customer", text: "Great. Can you share delivery timeline for the blue variant?", time: "11:08 AM" },
    ],
  },
  {
    id: 2,
    customerName: "Karan Mehta",
    phone: "+91 98700 55421",
    segment: "Cart Recovery",
    assignedTo: "Rahul Sharma",
    status: "Waiting",
    lastSeen: "14 min ago",
    unread: 0,
    satisfaction: "Price sensitive",
    lastMessage: "Please send the payment link once discount is applied.",
    notes: "Discount approval up to 7% without manager sign-off.",
    messages: [
      { id: 1, sender: "customer", text: "I want to order both units if there is any discount.", time: "10:31 AM" },
      { id: 2, sender: "agent", text: "I can support with a bundled offer and a quick payment link.", time: "10:36 AM" },
      { id: 3, sender: "system", text: "Discount request sent to pricing queue.", time: "10:40 AM" },
    ],
  },
  {
    id: 3,
    customerName: "Meera Kulkarni",
    phone: "+91 99010 77821",
    segment: "Support Escalation",
    assignedTo: "Amit Joshi",
    status: "Resolved",
    lastSeen: "42 min ago",
    unread: 0,
    satisfaction: "Resolved",
    lastMessage: "Thanks, the invoice copy has been received.",
    notes: "Invoice issue closed with updated GST details.",
    messages: [
      { id: 1, sender: "customer", text: "Need corrected invoice with GST number updated.", time: "09:12 AM" },
      { id: 2, sender: "agent", text: "Shared the revised PDF on this thread and email.", time: "09:20 AM" },
      { id: 3, sender: "customer", text: "Thanks, the invoice copy has been received.", time: "09:27 AM" },
    ],
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Ananya Rao",
    role: "Senior Agent",
    queue: "Priority Sales",
    phone: "+91 98111 22001",
    email: "ananya.rao@pulseadmin.in",
    status: "Online",
    conversations: 18,
    resolutionRate: "96%",
    shift: "09:00 AM - 06:00 PM",
    lastActive: "Now",
  },
  {
    id: 2,
    name: "Amit Joshi",
    role: "Support Lead",
    queue: "Post-sales",
    phone: "+91 98989 44567",
    email: "amit.joshi@pulseadmin.in",
    status: "Online",
    conversations: 11,
    resolutionRate: "94%",
    shift: "10:00 AM - 07:00 PM",
    lastActive: "3 min ago",
  },
  {
    id: 3,
    name: "Neha Iyer",
    role: "Campaign Ops",
    queue: "Outbound Campaigns",
    phone: "+91 98220 88776",
    email: "neha.iyer@pulseadmin.in",
    status: "Break",
    conversations: 6,
    resolutionRate: "91%",
    shift: "08:30 AM - 05:30 PM",
    lastActive: "18 min ago",
  },
  {
    id: 4,
    name: "Vikas Gupta",
    role: "QA Analyst",
    queue: "Template Review",
    phone: "+91 99584 11223",
    email: "vikas.gupta@pulseadmin.in",
    status: "Offline",
    conversations: 0,
    resolutionRate: "98%",
    shift: "02:00 PM - 11:00 PM",
    lastActive: "1 hr ago",
  },
];

export const contactSegments: ContactSegment[] = [
  { id: "recent-buyers", label: "Recent Buyers", contacts: 12640 },
  { id: "cart-dropoffs", label: "Cart Drop-offs", contacts: 8420 },
  { id: "gold-members", label: "Gold Members", contacts: 1890 },
  { id: "bengaluru-leads", label: "Bengaluru Leads", contacts: 5620 },
];

export const connectorOptions = [
  "Pulse Main Line",
  "North Region Sales",
  "Support Desk India",
];
