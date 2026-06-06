/**
 * Seed script for Maxim Protocol dashboard tables.
 *
 * Prerequisites:
 *   1. Run supabase/migrations/001_dashboard_tables.sql in your Supabase project.
 *   2. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.
 *      (Find it in: Supabase Dashboard → Project Settings → API → service_role key)
 *
 * Usage:
 *   npx tsx scripts/seed-dashboard.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ─── Load env ─────────────────────────────────────────────────────────────────

function loadEnv() {
  const envFiles = [".env"];
  for (const file of envFiles) {
    const p = path.resolve(process.cwd(), file);
    if (!fs.existsSync(p)) continue;
    const lines = fs.readFileSync(p, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dG93amRsdGt3b3Jua3R1b2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTAxMzcxMCwiZXhwIjoyMDk0NTg5NzEwfQ.4uYkKa-wlxn1-sBW05v4_XOuEWEg63U1cxXpJcJFJds;

if (!SUPABASE_URL) {
  console.error("❌  NEXT_PUBLIC_SUPABASE_URL is not set.");
  process.exit(1);
}
if (!SERVICE_ROLE_KEY) {
  console.error(
    "❌  SUPABASE_SERVICE_ROLE_KEY is not set.\n" +
    "    Add it to .env.local:\n" +
    "    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key\n" +
    "    (Supabase Dashboard → Project Settings → API → service_role)"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

const MIN  = 60_000;
const HR   = 3_600_000;
const DAY  = 86_400_000;
const WEEK = 604_800_000;

// ─── Seed Data ────────────────────────────────────────────────────────────────

const agents = [
  { id: "agt_01", name: "content-moderator",    model: "claude-haiku-4-5",   status: "active",   requests: 891400, latency: "98ms",  cache_hit: "91%", cost: 312, description: "Real-time content safety layer for user-generated media.",          tags: ["moderation", "real-time"] },
  { id: "agt_02", name: "customer-support-bot", model: "claude-haiku-4-5",   status: "active",   requests: 234700, latency: "112ms", cache_hit: "88%", cost: 187, description: "First-line support agent with escalation routing.",                 tags: ["support", "routing"] },
  { id: "agt_03", name: "research-agent-v2",    model: "claude-opus-4-7",    status: "active",   requests: 142300, latency: "287ms", cache_hit: "79%", cost: 843, description: "Deep research synthesis across internal and external corpora.",      tags: ["research", "synthesis"] },
  { id: "agt_04", name: "data-pipeline-agent",  model: "claude-sonnet-4-6",  status: "active",   requests: 89100,  latency: "194ms", cache_hit: "84%", cost: 201, description: "Structured data extraction and transformation pipeline.",            tags: ["data", "etl"] },
  { id: "agt_05", name: "code-review-agent",    model: "claude-opus-4-7",    status: "degraded", requests: 67200,  latency: "412ms", cache_hit: "72%", cost: 398, description: "Automated PR review with style and security checks.",                tags: ["code", "security"] },
  { id: "agt_06", name: "legal-analysis-v1",    model: "claude-sonnet-4-6",  status: "inactive", requests: 12000,  latency: "—",     cache_hit: "—",   cost: 0,   description: "Contract clause analysis and compliance flagging.",                 tags: ["legal", "compliance"] },
  { id: "agt_07", name: "email-drafting-bot",   model: "claude-haiku-4-5",   status: "active",   requests: 54800,  latency: "143ms", cache_hit: "82%", cost: 67,  description: "Context-aware email composition assistant for sales workflows.",     tags: ["email", "sales"] },
  { id: "agt_08", name: "sql-query-assistant",  model: "claude-sonnet-4-6",  status: "active",   requests: 31200,  latency: "221ms", cache_hit: "76%", cost: 89,  description: "Natural language to SQL translation with schema awareness.",         tags: ["sql", "data"] },
];

const deployments = [
  { id: "dep_01HVXK", name: "research-agent-v2",    model: "claude-opus-4-7",    status: "active",   requests: 142300, latency: "287ms", env: "production", created_at: ago(2 * HR) },
  { id: "dep_01HVXJ", name: "data-pipeline-agent",  model: "claude-sonnet-4-6",  status: "active",   requests: 89100,  latency: "194ms", env: "production", created_at: ago(5 * HR) },
  { id: "dep_01HVXI", name: "customer-support-bot", model: "claude-haiku-4-5",   status: "active",   requests: 234700, latency: "112ms", env: "production", created_at: ago(1 * DAY) },
  { id: "dep_01HVXH", name: "code-review-agent",    model: "claude-opus-4-7",    status: "degraded", requests: 67200,  latency: "412ms", env: "staging",    created_at: ago(2 * DAY) },
  { id: "dep_01HVXG", name: "content-moderator",    model: "claude-haiku-4-5",   status: "active",   requests: 891400, latency: "98ms",  env: "production", created_at: ago(3 * DAY) },
  { id: "dep_01HVXF", name: "legal-analysis-v1",    model: "claude-sonnet-4-6",  status: "inactive", requests: 12000,  latency: "—",     env: "staging",    created_at: ago(1 * WEEK) },
];

const apiKeys = [
  { id: "key_01", name: "Production — Web App",   prefix: "rail_prod_a7f2", scopes: ["read", "write", "deploy"], last_used_at: ago(2 * MIN),    active: true,  calls: 842100, created_at: new Date("Jan 12, 2026").toISOString() },
  { id: "key_02", name: "CI/CD Pipeline",          prefix: "rail_prod_b9c1", scopes: ["read", "deploy"],          last_used_at: ago(1 * HR),     active: true,  calls: 23400,  created_at: new Date("Jan 8, 2026").toISOString() },
  { id: "key_03", name: "Analytics Service",       prefix: "rail_prod_d4e8", scopes: ["read"],                    last_used_at: ago(3 * HR),     active: true,  calls: 7820,   created_at: new Date("Dec 29, 2025").toISOString() },
  { id: "key_04", name: "Staging — Integration",  prefix: "rail_stg_f3a0",  scopes: ["read", "write"],           last_used_at: ago(2 * DAY),    active: true,  calls: 2100,   created_at: new Date("Dec 14, 2025").toISOString() },
  { id: "key_05", name: "Legacy — Mobile App",     prefix: "rail_prod_g7b5", scopes: ["read"],                    last_used_at: ago(21 * DAY),   active: false, calls: 0,      created_at: new Date("Nov 1, 2025").toISOString() },
];

const activityEvents = [
  { event: "Deployment updated",   agent: "research-agent-v2",    event_type: "deploy",  created_at: ago(2 * MIN) },
  { event: "Cache spike detected", agent: "content-moderator",    event_type: "alert",   created_at: ago(8 * MIN) },
  { event: "New API key created",  agent: "System",               event_type: "key",     created_at: ago(23 * MIN) },
  { event: "Model upgraded",       agent: "customer-support-bot", event_type: "deploy",  created_at: ago(1 * HR) },
  { event: "Rate limit warning",   agent: "code-review-agent",    event_type: "warning", created_at: ago(2 * HR) },
  { event: "Billing cycle reset",  agent: "System",               event_type: "billing", created_at: ago(3 * HR) },
];

const systemServices = [
  { label: "API Gateway",   status: "operational", latency: "12ms",  uptime: "99.99%" },
  { label: "Model Router",  status: "operational", latency: "4ms",   uptime: "100%" },
  { label: "Cache Layer",   status: "operational", latency: "1ms",   uptime: "99.97%" },
  { label: "Webhook Relay", status: "degraded",    latency: "284ms", uptime: "99.71%" },
];

// 24 hourly data points for today
const requestVolumeData = [1200,1800,1400,2200,2800,2400,3100,2700,3400,3800,3200,4100,3700,4400,3900,4800,4200,5100,4600,5500,4900,5800,5200,6100];
const cacheHitData      = [82,84,83,85,86,85,87,86,88,87,89,88,87,89,90,88,89,91,90,89,88,87,88,87];
const costData          = [420,380,510,490,440,530,480,560,520,470,610,580,540,590,620,570,640,600,580,660,630,610,680,650];

const hourlyMetrics = requestVolumeData.map((rv, i) => ({
  hour_index:     i,
  request_volume: rv,
  cache_hit_rate: cacheHitData[i],
  cost:           costData[i],
  recorded_date:  new Date().toISOString().slice(0, 10),
}));

const latencyMetrics = [
  { agent_name: "content-moderator",    p50: "98ms",  p90: "143ms", p99: "201ms", max_latency: "312ms", sparkline_data: [90,95,88,100,92,98,95] },
  { agent_name: "customer-support-bot", p50: "112ms", p90: "167ms", p99: "244ms", max_latency: "389ms", sparkline_data: [110,108,115,112,120,109,113] },
  { agent_name: "data-pipeline-agent",  p50: "194ms", p90: "287ms", p99: "412ms", max_latency: "601ms", sparkline_data: [190,198,185,200,195,188,194] },
  { agent_name: "research-agent-v2",    p50: "287ms", p90: "421ms", p99: "589ms", max_latency: "842ms", sparkline_data: [280,295,271,300,290,283,287] },
  { agent_name: "code-review-agent",    p50: "412ms", p90: "623ms", p99: "891ms", max_latency: "1.2s",  sparkline_data: [400,430,380,450,420,408,412] },
];

// ─── Upsert helpers ───────────────────────────────────────────────────────────

async function upsert(table: string, rows: object[], conflictCol = "id") {
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: conflictCol });
  if (error) throw new Error(`${table}: ${error.message}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding Maxim Protocol dashboard tables…\n");

  const steps: Array<{ label: string; fn: () => Promise<void> }> = [
    { label: "agents",           fn: () => upsert("agents", agents) },
    { label: "deployments",      fn: () => upsert("deployments", deployments) },
    { label: "api_keys",         fn: () => upsert("api_keys", apiKeys) },
    {
      label: "activity_events",
      fn: async () => {
        // Truncate first so relative timestamps stay fresh on re-runs
        await supabase.from("activity_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        const { error } = await supabase.from("activity_events").insert(activityEvents);
        if (error) throw new Error(`activity_events: ${error.message}`);
      },
    },
    {
      label: "system_services",
      fn: () => upsert("system_services", systemServices, "label"),
    },
    {
      label: "hourly_metrics",
      fn: () => upsert("hourly_metrics", hourlyMetrics, "hour_index,recorded_date"),
    },
    {
      label: "latency_metrics",
      fn: () => upsert("latency_metrics", latencyMetrics, "agent_name"),
    },
  ];

  for (const { label, fn } of steps) {
    process.stdout.write(`  • ${label.padEnd(22)}`);
    try {
      await fn();
      console.log("✓");
    } catch (err) {
      console.log("✗");
      console.error(`    ${(err as Error).message}`);
      process.exit(1);
    }
  }

  console.log("\n✅  Done! Open the dashboard to see live data.");
}

main();
