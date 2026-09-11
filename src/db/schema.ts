import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  doublePrecision,
  index,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export type UserSystemRole = "user" | "super_admin";
export const reportStatusEnum = pgEnum("report_status", [
  "draft",
  "in_inspection",
  "completed",
  "archived",
]);

export const criticalityLevelEnum = pgEnum("criticality_level", [
  "normal",
  "attention",
  "urgent",
  "critical",
]);

export const annotationEntityTypeEnum = pgEnum("annotation_entity_type", [
  "customer",
  "report",
  "electrical_panel",
  "column_panel",
  "thermogram",
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: text("role").$type<UserSystemRole>().default("user").notNull(),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activeOrganizationId: text("active_organization_id"),
    ...timestamps,
  },
  (self) => [
    index("session_user_id_idx").on(self.userId),
    index("session_active_org_idx").on(self.activeOrganizationId),
  ],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    issuer: text("issuer"),
    ...timestamps,
  },
  (self) => [index("account_user_id_idx").on(self.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
});

export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  gatewayPriceId: text("gateway_price_id"),
  priceMonthly: integer("price_monthly").notNull(),
  priceExtraReport: integer("price_extra_report").default(0).notNull(),
  monthlyReportLimit: integer("monthly_report_limit").notNull().default(5),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  gatewayCustomerId: text("gateway_customer_id").unique(),
  reportsUsedThisMonth: integer("reports_used_this_month").default(0).notNull(),
  document: text("document"),
  corporateName: text("corporate_name"),
  stateRegistration: text("state_registration"),
  phone: text("phone"),
  address: text("address"),
  ...timestamps,
});

export type OrganizationRole =
  | "owner"
  | "admin"
  | "engineer"
  | "technician"
  | "viewer";

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").$type<OrganizationRole>().default("viewer").notNull(),
    ...timestamps,
  },
  (self) => [
    uniqueIndex("member_org_user_unique").on(self.organizationId, self.userId),
    index("member_user_id_idx").on(self.userId),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    gatewaySubscriptionId: text("gateway_subscription_id").unique(),
    status: text("status").notNull().default("active"),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
    }).notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    ...timestamps,
  },
  (self) => [
    index("subscriptions_org_id_idx").on(self.organizationId),
    index("subscriptions_plan_id_idx").on(self.planId),
  ],
);

export const customer = pgTable(
  "customer",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    document: text("document"),
    address: text("address"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    ...timestamps,
  },
  (self) => [index("customer_org_idx").on(self.organizationId)],
);

export const report = pgTable(
  "report",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => customer.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    status: reportStatusEnum("status").default("draft").notNull(),

    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),

    technicianName: text("technician_name"),

    engineerUserId: text("engineer_user_id").references(() => user.id, {
      onDelete: "set null",
    }),

    creaNumber: text("crea_number"),
    artNumber: text("art_number"),
    ...timestamps,
  },
  (self) => [
    index("report_org_idx").on(self.organizationId),
    index("report_customer_idx").on(self.customerId),
  ],
);

export const electricalPanel = pgTable(
  "electrical_panel",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    reportId: text("report_id")
      .notNull()
      .references(() => report.id, { onDelete: "cascade" }),
    name: text("name").notNull(),

    block: text("block"),
    floor: text("floor"),
    location: text("location"),

    voltage: text("voltage"),
    mainBreakerCurrent: integer("main_breaker_current"),

    photoStartNumber: integer("photo_start_number"),
    photoEndNumber: integer("photo_end_number"),
    ...timestamps,
  },
  (self) => [
    index("electrical_panel_report_idx").on(self.reportId),
    index("panel_org_idx").on(self.organizationId),
    index("electrical_panel_location_idx").on(self.block, self.floor),
  ],
);

export const columnPanel = pgTable(
  "column_panel",
  {
    id: text("id").primaryKey(),
    electricalPanelId: text("electrical_panel_id")
      .notNull()
      .references(() => electricalPanel.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    order: integer("order").default(1).notNull(),
    ...timestamps,
  },
  (self) => [
    index("column_panel_electrical_panel_idx").on(self.electricalPanelId),
  ],
);

export const thermogram = pgTable(
  "thermogram",
  {
    id: text("id").primaryKey(),
    columnPanelId: text("column_panel_id")
      .notNull()
      .references(() => columnPanel.id, { onDelete: "cascade" }),
    thermalImageUrl: text("thermal_image_url").notNull(),
    visibleImageUrl: text("visible_image_url"),
    description: text("description"),
    ...timestamps,
  },
  (self) => [index("thermogram_column_panel_idx").on(self.columnPanelId)],
);

export const thermogramMetadata = pgTable("thermogram_metadata", {
  id: text("id").primaryKey(),
  thermogramId: text("thermogram_id")
    .notNull()
    .unique()
    .references(() => thermogram.id, { onDelete: "cascade" }),

  maxTemperature: doublePrecision("max_temperature").notNull(),
  minTemperature: doublePrecision("min_temperature"),
  referenceTemperature: doublePrecision("reference_temperature").notNull(),
  deltaT: doublePrecision("delta_t").notNull(),

  emissivity: doublePrecision("emissivity").default(0.95).notNull(),
  reflectedTemperature: doublePrecision("reflected_temperature"),
  atmosphericTemperature: doublePrecision("atmospheric_temperature"),
  relativeHumidity: doublePrecision("relative_humidity"),
  objectDistance: doublePrecision("object_distance"),

  criticality: criticalityLevelEnum("criticality").notNull(),
  recommendation: text("recommendation"),

  ...timestamps,
});

export const annotation = pgTable(
  "annotation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    entityType: annotationEntityTypeEnum("entity_type").notNull(),
    entityId: text("entity_id").notNull(),

    authorUserId: text("author_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    content: text("content").notNull(),

    isResolved: boolean("is_resolved").default(false).notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedByUserId: text("resolved_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),

    ...timestamps,
  },
  (self) => [
    index("annotation_entity_idx").on(self.entityType, self.entityId),
    index("annotation_org_idx").on(self.organizationId),
  ],
);
