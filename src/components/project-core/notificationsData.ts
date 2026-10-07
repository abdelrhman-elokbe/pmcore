export const triggerEvents = [
  "Stage entered",
  "Submitted for approval",
  "Approved",
  "Rejected",
  "Returned",
  "Overdue / SLA breach",
  "X days before due date",
] as const;

export const recipientRoles = [
  "Project Manager",
  "Sponsor",
  "PMO",
  "Approver",
  "Stage owner",
] as const;

export const specificRecipients = [
  "s.almansoori (user)",
  "m.tarek (user)",
  "PMO Leadership (group)",
  "Finance Committee (group)",
];

export type Channel = "In-app" | "Email";

export type NotificationRule = {
  id: string;
  event: string;
  daysBefore?: number;
  roles: string[];
  specific: string[];
  channels: Channel[];
  template: string;
  enabled: boolean;
};

/** Tenant-wide defaults (Notifications screen). Stage rules override these. */
export const globalDefaultRules: NotificationRule[] = [
  {
    id: "g1",
    event: "Submitted for approval",
    roles: ["Approver"],
    specific: [],
    channels: ["In-app", "Email"],
    template: "{{project.name}} has been submitted for your approval at {{stage.name}}.",
    enabled: true,
  },
  {
    id: "g2",
    event: "Approved",
    roles: ["Project Manager"],
    specific: [],
    channels: ["In-app"],
    template: "{{stage.name}} for {{project.name}} was approved by {{actor.name}}.",
    enabled: true,
  },
  {
    id: "g3",
    event: "Returned",
    roles: ["Project Manager"],
    specific: [],
    channels: ["In-app", "Email"],
    template: "{{stage.name}} for {{project.name}} was returned: {{comment}}",
    enabled: true,
  },
  {
    id: "g4",
    event: "Overdue / SLA breach",
    roles: ["PMO", "Stage owner"],
    specific: [],
    channels: ["Email"],
    template: "SLA breached on {{stage.name}} for {{project.name}}.",
    enabled: true,
  },
];

const seeds: Record<string, NotificationRule[]> = {
  proposal: [
    {
      id: "p1",
      event: "Submitted for approval",
      roles: ["PMO", "Approver"],
      specific: ["PMO Leadership (group)"],
      channels: ["In-app", "Email"],
      template: "New proposal {{project.name}} awaits PMO review.",
      enabled: true,
    },
  ],
  execution: [
    {
      id: "e1",
      event: "X days before due date",
      daysBefore: 5,
      roles: ["Project Manager", "Sponsor"],
      specific: [],
      channels: ["Email"],
      template: "{{project.name}} milestone due in {{days}} days.",
      enabled: true,
    },
  ],
};

export const getSeedRules = (scopeId: string) => seeds[scopeId] ?? [];
