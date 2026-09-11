import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  organization,
  createAccessControl,
  admin as adminPlugin,
} from "better-auth/plugins";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";

const statement = {
  organization: ["update", "delete"],
  member: ["create", "read", "update", "delete"],
  customers: ["create", "read", "update", "delete"],
  reports: ["create", "read", "update", "delete"],
  invitation: ["create", "read", "cancel"],
} as const;

const ac = createAccessControl(statement);

const owner = ac.newRole({
  organization: ["update", "delete"],
  member: ["create", "read", "update", "delete"],
  customers: ["create", "read", "update", "delete"],
  invitation: ["create", "read", "cancel"],
  reports: ["create", "read", "update", "delete"],
});

const admin = ac.newRole({
  customers: ["create", "read", "update", "delete"],
  member: ["create", "read", "update"],
  invitation: ["create", "read", "cancel"],
  reports: ["create", "read", "update", "delete"],
});

const engineer = ac.newRole({
  member: ["read"],
  reports: ["create", "read", "update"],
  customers: ["create", "read", "update"],
});

const technician = ac.newRole({
  member: ["read"],
  reports: ["create", "read"],
  customers: ["read"],
});

const viewer = ac.newRole({
  reports: ["read"],
});

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
  "https://new-report-five.vercel.app",
].filter(Boolean) as string[];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  trustedOrigins: allowedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    adminPlugin(),
    organization({
      ac,
      roles: {
        owner,
        admin,
        engineer,
        technician,
        viewer,
      },
    }),
  ],
  advanced: {
    useSecureCookies: true,
    cookies: {
      session_token: {
        attributes: {
          sameSite: "none",
          secure: true,
        },
      },
    },
  },
});
