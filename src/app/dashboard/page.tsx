"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Bot, Rocket, BarChart3, Key, Settings,
  Bell, Search, TrendingUp, TrendingDown, Activity, Zap,
  DollarSign, MoreHorizontal, AlertCircle, Plus, ExternalLink,
  LogOut, RefreshCcw, ChevronRight, Copy, Trash2,
  Eye, EyeOff, Shield, Clock,
  Check, X, Terminal,
  ArrowUpRight, Filter,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Agent {
  id: string;
  name: string;
  model: string;
  status: string;
  requests: number;
  latency: string;
  cache_hit: string;
  cost: number;
  description: string;
  tags: string[];
}

interface Deployment {
  id: string;
  name: string;
  model: string;
  status: string;
  requests: number;
  latency: string;
  env: string;
  created_at: string;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  last_used_at: string | null;
  active: boolean;
  calls: number;
  created_at: string;
}

interface ActivityEvent {
  id: string;
  event: string;
  agent: string;
  event_type: string;
  created_at: string;
}

interface SystemService {
  id: string;
  label: string;
  status: string;
  latency: string;
  uptime: string;
}

interface HourlyMetric {
  id: string;
  hour_index: number;
  request_volume: number;
  cache_hit_rate: number;
  cost: number;
}

interface LatencyMetric {
  id: string;
  agent_name: string;
  p50: string;
  p90: string;
  p99: string;
  max_latency: string;
  sparkline_data: number[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: string | null | undefined): string {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs  = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  const wks  = Math.floor(diff / 604_800_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins} min ago`;
  if (hrs   < 24) return `${hrs} hr${hrs  === 1 ? "" : "s"} ago`;
  if (days  < 7)  return `${days} day${days === 1 ? "" : "s"} ago`;
  return `${wks} week${wks === 1 ? "" : "s"} ago`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatRequests(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Shared Components ────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn(
      "flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px]",
      status === "active"   ? "bg-emerald-500/10 text-emerald-600" :
      status === "degraded" ? "bg-amber-500/10 text-amber-600" :
                              "bg-white/[0.05] text-white/55"
    )}>
      <span className={cn(
        "h-1 w-1 rounded-full",
        status === "active" ? "bg-emerald-500" : status === "degraded" ? "bg-amber-500" : "bg-white/10"
      )} />
      {status}
    </span>
  );
}

function StatCard({ icon, label, value, delta, deltaLabel, accent }: {
  icon: React.ReactNode; label: string; value: string;
  delta: number; deltaLabel: string; accent?: boolean;
}) {
  const positive = delta >= 0;
  return (
    <div className={cn(
      "flex cursor-default flex-col gap-4 rounded-xl border bg-[#18181b] p-5 transition-colors hover:bg-white/[0.02]",
      accent ? "border-white/10" : "border-white/[0.08]"
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-white/75">{label}</span>
        <span className={cn("rounded-lg p-1.5", accent ? "bg-white/[0.06] text-white" : "bg-white/[0.05] text-white/75")}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-3xl font-light text-white">{value}</p>
        <p className={cn("mt-1 flex items-center gap-1 text-[11px]", positive ? "text-emerald-600" : "text-red-600")}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {positive ? "+" : ""}{delta}%&nbsp;{deltaLabel}
        </p>
      </div>
    </div>
  );
}

function MiniBar({ data, color = "#000" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="relative flex h-8 gap-px">
      {data.map((v, i) => (
        <div key={i} className="relative h-full flex-1">
          <div
            className="absolute bottom-0 left-0 right-0 rounded-sm opacity-60"
            style={{ height: `${(v / max) * 100}%`, background: color }}
          />
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-normal tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/75">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ agents, deployments, activityFeed, systemServices, hourlyMetrics }: {
  agents: Agent[];
  deployments: Deployment[];
  activityFeed: ActivityEvent[];
  systemServices: SystemService[];
  hourlyMetrics: HourlyMetric[];
}) {
  const [chartTab, setChartTab] = useState<"24h" | "7d" | "30d">("24h");

  const requestVolume = hourlyMetrics.map((m) => m.request_volume);
  const maxReq = Math.max(...requestVolume, 1);

  const activeAgentCount = agents.filter((a) => a.status === "active").length;
  const totalRequests    = requestVolume.reduce((s, v) => s + v, 0);
  const avgCacheHit      = hourlyMetrics.length
    ? +(hourlyMetrics.reduce((s, m) => s + m.cache_hit_rate, 0) / hourlyMetrics.length).toFixed(1)
    : 0;
  const monthlyCost = hourlyMetrics.reduce((s, m) => s + m.cost, 0);

  const peakReq = Math.max(...requestVolume, 0);
  const avgReq  = requestVolume.length ? Math.round(totalRequests / requestVolume.length) : 0;

  return (
    <div className="space-y-6">
      <SectionHeader title="Overview" subtitle="Monitor your Maxim Protocol infrastructure in real time." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<Bot className="h-4 w-4" />}        label="Active Agents"  value={String(activeAgentCount)}                 delta={3}    deltaLabel="this week"    accent />
        <StatCard icon={<Activity className="h-4 w-4" />}   label="Total Requests" value={formatRequests(totalRequests)}              delta={12.4} deltaLabel="today" />
        <StatCard icon={<Zap className="h-4 w-4" />}        label="Cache Hit Rate" value={`${avgCacheHit}%`}                          delta={2.1}  deltaLabel="vs last week" />
        <StatCard icon={<DollarSign className="h-4 w-4" />} label="Monthly Cost"   value={`$${monthlyCost.toLocaleString()}`}         delta={-8.2} deltaLabel="vs last month" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Chart */}
        <div className="col-span-1 rounded-xl border border-white/[0.08] bg-[#18181b] p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-white">Request Volume</h2>
              <p className="mt-0.5 text-xs text-white/75">Requests processed per hour</p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] p-0.5">
              {(["24h", "7d", "30d"] as const).map((t) => (
                <button key={t} onClick={() => setChartTab(t)}
                  className={cn("cursor-pointer rounded-md px-2.5 py-1 text-xs transition-all",
                    chartTab === t ? "bg-white/[0.08] text-white" : "text-white/60 hover:text-white")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="relative flex h-36 gap-1">
            {requestVolume.map((v, i) => {
              const isRecent = i >= requestVolume.length - 1;
              return (
                <div key={i} className="group relative h-full flex-1 cursor-default">
                  <div className={cn("absolute bottom-0 left-0 right-0 rounded-sm transition-colors",
                    isRecent ? "bg-white/60 group-hover:bg-white/80" : "bg-white/[0.14] group-hover:bg-white/[0.2]")}
                    style={{ height: `${(v / maxReq) * 100}%` }} />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/80">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>now</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-4">
            {[
              { l: "Peak",       v: formatRequests(peakReq), u: "req/hr" },
              { l: "Average",    v: formatRequests(avgReq),  u: "req/hr" },
              { l: "Total (24h)",v: formatRequests(totalRequests), u: "requests" },
            ].map(({ l, v, u }) => (
              <div key={l}>
                <p className="text-[10px] uppercase tracking-wider text-white/55">{l}</p>
                <p className="mt-0.5 text-sm text-white">{v} <span className="text-[10px] text-white/75">{u}</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* Top agents */}
        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Top Agents</h2>
            <button className="flex cursor-pointer items-center gap-1 text-[10px] text-white transition-colors hover:text-white/80">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-4">
            {agents.slice(0, 5).map((a, idx) => {
              const pct   = agents[0].requests > 0 ? Math.round((a.requests / agents[0].requests) * 100) : 0;
              const trend = [+11.7, -2.3, +4.2, +1.8, -8.1][idx] ?? 0;
              return (
                <div key={a.id} className="group cursor-pointer">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full",
                        a.status === "active" ? "bg-emerald-500" : a.status === "degraded" ? "bg-amber-500" : "bg-white/10")} />
                      <span className="truncate text-xs text-white/75 transition-colors group-hover:text-white">{a.name}</span>
                    </div>
                    <span className={cn("ml-2 shrink-0 text-[10px]", trend >= 0 ? "text-emerald-600" : "text-red-600")}>
                      {trend >= 0 ? "+" : ""}{trend}%
                    </span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/[0.05]">
                    <div className="h-full rounded-full bg-white/50 transition-all group-hover:bg-white/80" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Deployments table */}
        <div className="col-span-1 overflow-hidden rounded-xl border border-white/[0.08] bg-[#18181b] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
            <h2 className="text-sm font-medium text-white">Recent Deployments</h2>
            <button className="flex cursor-pointer items-center gap-1 text-[10px] text-white transition-colors hover:text-white/80">
              Manage <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Agent", "Model", "Status", "Requests", "Latency", "Created", ""].map((h, i) => (
                    <th key={h + i} className={cn("py-3 text-[10px] font-normal uppercase tracking-wider text-white/55",
                      i === 0 ? "px-5 text-left" : i === 6 ? "w-8 px-3" : i >= 3 ? "px-3 text-right" : "px-3 text-left")}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deployments.map((dep) => (
                  <tr key={dep.id} className="group cursor-pointer border-b border-white/[0.05] transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <p className="text-white/80 transition-colors group-hover:text-white">{dep.name}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-white/80">{dep.id}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/75">{dep.model}</span>
                    </td>
                    <td className="px-3 py-3"><StatusPill status={dep.status} /></td>
                    <td className="px-3 py-3 text-right text-white/80">{formatRequests(dep.requests)}</td>
                    <td className="px-3 py-3 text-right text-white/80">{dep.latency}</td>
                    <td className="px-3 py-3 text-right text-white/55">{timeAgo(dep.created_at)}</td>
                    <td className="px-3 py-3 text-right">
                      <button className="cursor-pointer text-white/55 opacity-0 transition-opacity hover:text-white/80 group-hover:opacity-100">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Activity</h2>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600">
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <div className="space-y-3">
            {activityFeed.map((item) => (
              <div key={item.id} className="group flex cursor-pointer gap-3">
                <div className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  item.event_type === "deploy" ? "bg-white/[0.06] text-white" :
                  item.event_type === "alert" || item.event_type === "warning" ? "bg-amber-500/10 text-amber-600" :
                  "bg-white/[0.05] text-white/55")}>
                  {item.event_type === "deploy"  && <Rocket       className="h-2.5 w-2.5" />}
                  {(item.event_type === "alert" || item.event_type === "warning") && <AlertCircle className="h-2.5 w-2.5" />}
                  {item.event_type === "key"     && <Key          className="h-2.5 w-2.5" />}
                  {item.event_type === "billing" && <DollarSign   className="h-2.5 w-2.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/75 transition-colors group-hover:text-white">{item.event}</p>
                  <p className="mt-0.5 text-[10px] text-white/55">{item.agent} · {timeAgo(item.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-14 w-full cursor-pointer rounded-full border border-white/[0.08] py-2 text-xs text-white/75 transition-all hover:bg-white/[0.04] hover:text-white/75">
            View all activity
          </button>
        </div>
      </div>

      {/* System health */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-white/80">System Health</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {systemServices.map((svc) => (
            <div key={svc.label} className="cursor-pointer rounded-xl border border-white/[0.08] bg-[#18181b] p-4 transition-colors hover:border-white/20">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-white/80">{svc.label}</span>
                <span className={cn("flex items-center gap-1 text-[10px]",
                  svc.status === "operational" ? "text-emerald-600" : "text-amber-600")}>
                  <span className={cn("h-1.5 w-1.5 rounded-full",
                    svc.status === "operational" ? "bg-emerald-500" : "bg-amber-500")} />
                  {svc.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/80">Latency</p>
                  <p className="mt-0.5 text-sm text-white">{svc.latency}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/80">Uptime</p>
                  <p className="mt-0.5 text-sm text-white">{svc.uptime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Agents ──────────────────────────────────────────────────────────────

function AgentsTab({ agents, onNewAgent }: { agents: Agent[]; onNewAgent: () => void }) {
  const [filter, setFilter] = useState("all");
  const filters  = ["all", "active", "degraded", "inactive"];
  const filtered = filter === "all" ? agents : agents.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Agents"
        subtitle={`${agents.filter((a) => a.status === "active").length} active · ${agents.length} total`}
        action={
          <button onClick={onNewAgent} className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/80">
            <Plus className="h-3.5 w-3.5" /> New Agent
          </button>
        }
      />

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-white/55" />
        <div className="flex gap-1">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("cursor-pointer rounded-full px-3 py-1 text-xs capitalize transition-all",
                filter === f ? "bg-white/[0.08] text-white" : "text-white/60 hover:text-white")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((agent) => (
          <div key={agent.id} className="group cursor-pointer rounded-xl border border-white/[0.08] bg-[#18181b] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.02]">
            <div className="mb-3 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full",
                    agent.status === "active" ? "bg-emerald-500" : agent.status === "degraded" ? "bg-amber-500" : "bg-white/10")} />
                  <h3 className="text-sm font-medium text-white transition-colors group-hover:text-white">{agent.name}</h3>
                </div>
                <p className="mt-1 text-xs text-white/75 leading-relaxed">{agent.description}</p>
              </div>
              <button className="ml-3 cursor-pointer shrink-0 text-white/80 opacity-0 transition-opacity hover:text-white/75 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              {agent.tags.map((t) => (
                <span key={t} className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] text-white/55">{t}</span>
              ))}
              <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/55">{agent.model}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-3 sm:grid-cols-4">
              {[
                { l: "Requests", v: formatRequests(agent.requests) },
                { l: "Latency",  v: agent.latency },
                { l: "Cache",    v: agent.cache_hit },
                { l: "Cost",     v: agent.cost > 0 ? `$${agent.cost}` : "$0" },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p className="text-[10px] uppercase tracking-wider text-white/80">{l}</p>
                  <p className="mt-0.5 text-xs text-white/75">{v}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Deployments ─────────────────────────────────────────────────────────

function DeploymentsTab({ deployments, onNewDeployment }: {
  deployments: Deployment[];
  onNewDeployment: () => void;
}) {
  const [envFilter,    setEnvFilter]    = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = deployments.filter((d) =>
    (envFilter    === "all" || d.env    === envFilter) &&
    (statusFilter === "all" || d.status === statusFilter)
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Deployments"
        subtitle="Manage agent runtime configurations."
        action={
          <button onClick={onNewDeployment} className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/80">
            <Plus className="h-3.5 w-3.5" /> New Deployment
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { l: "Total",      v: String(deployments.length),                                        sub: "all envs" },
          { l: "Production", v: String(deployments.filter((d) => d.env === "production").length),  sub: "deployments" },
          { l: "Staging",    v: String(deployments.filter((d) => d.env === "staging").length),     sub: "deployments" },
          { l: "Degraded",   v: String(deployments.filter((d) => d.status === "degraded").length), sub: "need attention" },
        ].map(({ l, v, sub }) => (
          <div key={l} className="cursor-default rounded-xl border border-white/[0.08] bg-[#18181b] p-4 transition-colors hover:bg-white/[0.02]">
            <p className="text-[10px] uppercase tracking-wider text-white/55">{l}</p>
            <p className="mt-1 text-2xl font-light text-white">{v}</p>
            <p className="text-[10px] text-white/80">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {["all", "production", "staging"].map((e) => (
            <button key={e} onClick={() => setEnvFilter(e)}
              className={cn("cursor-pointer rounded-full px-3 py-1 text-xs capitalize transition-all",
                envFilter === e ? "bg-white/[0.08] text-white" : "text-white/60 hover:text-white")}>
              {e === "all" ? "All Envs" : e}
            </button>
          ))}
        </div>
        <div className="h-3.5 w-px bg-white/[0.06]" />
        <div className="flex items-center gap-1">
          {["all", "active", "degraded", "inactive"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("cursor-pointer rounded-full px-3 py-1 text-xs capitalize transition-all",
                statusFilter === s ? "bg-white/[0.08] text-white" : "text-white/60 hover:text-white")}>
              {s === "all" ? "All Status" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#18181b]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.08]">
                {["Agent", "Environment", "Model", "Status", "Requests", "Latency", "Created", ""].map((h, i) => (
                  <th key={h + i} className={cn("py-3 text-[10px] font-normal uppercase tracking-wider text-white/55",
                    i === 0 ? "px-5 text-left" : i === 7 ? "w-8 px-3" : i >= 4 ? "px-3 text-right" : "px-3 text-left")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((dep) => (
                <tr key={dep.id} className="group cursor-pointer border-b border-white/[0.05] transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <p className="text-white/80 transition-colors group-hover:text-white">{dep.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-white/80">{dep.id}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px]",
                      dep.env === "production" ? "bg-white/[0.06] text-white/80" : "bg-white/[0.05] text-white/55")}>
                      {dep.env}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/75">{dep.model}</span>
                  </td>
                  <td className="px-3 py-3.5"><StatusPill status={dep.status} /></td>
                  <td className="px-3 py-3.5 text-right text-white/80">{formatRequests(dep.requests)}</td>
                  <td className="px-3 py-3.5 text-right text-white/80">{dep.latency}</td>
                  <td className="px-3 py-3.5 text-right text-white/55">{timeAgo(dep.created_at)}</td>
                  <td className="px-3 py-3.5 text-right">
                    <button className="cursor-pointer text-white/55 opacity-0 transition-opacity hover:text-white/80 group-hover:opacity-100">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-white/80">No deployments match the selected filters.</div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Analytics ───────────────────────────────────────────────────────────

function AnalyticsTab({ agents, hourlyMetrics, latencyMetrics }: {
  agents: Agent[];
  hourlyMetrics: HourlyMetric[];
  latencyMetrics: LatencyMetric[];
}) {
  const [range, setRange] = useState<"24h" | "7d" | "30d">("24h");

  const requestVolume = hourlyMetrics.map((m) => m.request_volume);
  const costData      = hourlyMetrics.map((m) => m.cost);
  const cacheHitData  = hourlyMetrics.map((m) => m.cache_hit_rate);

  const maxReq  = Math.max(...requestVolume, 1);
  const maxCost = Math.max(...costData, 1);

  const totalRequests = requestVolume.reduce((s, v) => s + v, 0);
  const avgCacheHit   = hourlyMetrics.length
    ? +(hourlyMetrics.reduce((s, m) => s + m.cache_hit_rate, 0) / hourlyMetrics.length).toFixed(1)
    : 0;
  const totalCost = costData.reduce((s, v) => s + v, 0);

  // Avg latency from latency_metrics p50 values
  const avgLatencyMs = latencyMetrics.length
    ? Math.round(
        latencyMetrics.reduce((s, l) => {
          const raw = l.p50.replace("ms", "").replace("s", "000");
          const n = parseInt(raw, 10);
          return s + (isNaN(n) ? 0 : n);
        }, 0) / latencyMetrics.length
      )
    : 0;

  // Model usage breakdown computed from agents
  const totalAgentReqs = agents.reduce((s, a) => s + a.requests, 0);
  const modelMap = new Map<string, number>();
  agents.forEach((a) => modelMap.set(a.model, (modelMap.get(a.model) ?? 0) + a.requests));
  const modelColors: Record<string, string> = {
    "claude-haiku-4-5":  "#ffffff",
    "claude-sonnet-4-6": "#aaaaaa",
    "claude-opus-4-7":   "#666666",
  };
  const modelUsage = Array.from(modelMap.entries())
    .map(([model, req]) => ({
      model,
      pct:   totalAgentReqs > 0 ? Math.round((req / totalAgentReqs) * 100) : 0,
      req:   formatRequests(req),
      color: modelColors[model] ?? "#777777",
    }))
    .sort((a, b) => b.pct - a.pct);

  // Cost by agent
  const maxAgentCost = Math.max(...agents.map((a) => a.cost), 1);
  const costByAgent = [...agents]
    .filter((a) => a.cost > 0)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5)
    .map((a) => ({
      name: a.name,
      cost: `$${a.cost}`,
      pct:  Math.round((a.cost / maxAgentCost) * 100),
    }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analytics"
        subtitle="Usage metrics, cost breakdown, and performance insights."
        action={
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] p-0.5">
            {(["24h", "7d", "30d"] as const).map((t) => (
              <button key={t} onClick={() => setRange(t)}
                className={cn("cursor-pointer rounded-md px-2.5 py-1 text-xs transition-all",
                  range === t ? "bg-white/[0.08] text-white" : "text-white/60 hover:text-white")}>
                {t}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<Activity className="h-4 w-4" />}   label="Total Requests" value={formatRequests(totalRequests)}              delta={12.4} deltaLabel="vs prior period" accent />
        <StatCard icon={<Zap className="h-4 w-4" />}        label="Cache Hit Rate" value={`${avgCacheHit}%`}                          delta={2.1}  deltaLabel="vs prior period" />
        <StatCard icon={<Clock className="h-4 w-4" />}      label="Avg Latency"    value={avgLatencyMs > 0 ? `${avgLatencyMs}ms` : "—"} delta={-6.4} deltaLabel="vs prior period" />
        <StatCard icon={<DollarSign className="h-4 w-4" />} label="Total Cost"     value={`$${totalCost.toLocaleString()}`}             delta={-8.2} deltaLabel="vs prior period" />
      </div>

      {/* Two big charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Request volume */}
        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
          <h2 className="mb-1 text-sm font-medium text-white">Request Volume</h2>
          <p className="mb-4 text-xs text-white/75">Hourly request throughput</p>
          <div className="relative flex h-32 gap-1">
            {requestVolume.map((v, i) => (
              <div key={i} className="group relative h-full flex-1 cursor-default">
                <div className={cn("absolute bottom-0 left-0 right-0 rounded-sm transition-colors",
                  i >= requestVolume.length - 4 ? "bg-white/60 group-hover:bg-white/80" : "bg-white/[0.07] group-hover:bg-white/[0.14]")}
                  style={{ height: `${(v / maxReq) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/80">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>now</span>
          </div>
        </div>

        {/* Cost */}
        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
          <h2 className="mb-1 text-sm font-medium text-white">Cost Over Time</h2>
          <p className="mb-4 text-xs text-white/75">Hourly spend in USD</p>
          <div className="relative flex h-32 gap-1">
            {costData.map((v, i) => (
              <div key={i} className="group relative h-full flex-1 cursor-default">
                <div className="absolute bottom-0 left-0 right-0 rounded-sm bg-white/[0.07] transition-colors group-hover:bg-white/[0.14]"
                  style={{ height: `${(v / maxCost) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/80">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>now</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Model breakdown */}
        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
          <h2 className="mb-4 text-sm font-medium text-white">Model Usage</h2>
          <div className="space-y-4">
            {modelUsage.map((m) => (
              <div key={m.model}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/80">{m.model}</span>
                  <span className="text-[10px] text-white/75">{m.req}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full transition-all" style={{ width: `${m.pct}%`, background: m.color, opacity: 0.7 }} />
                </div>
                <p className="mt-1 text-right text-[10px] text-white/55">{m.pct}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cache hit rate */}
        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
          <h2 className="mb-1 text-sm font-medium text-white">Cache Hit Rate</h2>
          <p className="mb-4 text-xs text-white/75">% of requests served from cache</p>
          <div className="relative flex h-24 gap-1">
            {cacheHitData.map((v, i) => (
              <div key={i} className="group relative h-full flex-1 cursor-default">
                <div className="absolute bottom-0 left-0 right-0 rounded-sm bg-emerald-500/30 transition-colors group-hover:bg-emerald-500/50"
                  style={{ height: `${Math.max(0, ((v - 70) / 30) * 100)}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-end gap-4 border-t border-white/[0.08] pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/80">Current</p>
              <p className="text-sm text-white">{avgCacheHit}%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/80">Target</p>
              <p className="text-sm text-white">90%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/80">Savings</p>
              <p className="text-sm text-emerald-600">${Math.round(totalCost * (avgCacheHit / 100) * 0.18)}</p>
            </div>
          </div>
        </div>

        {/* Top cost agents */}
        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
          <h2 className="mb-4 text-sm font-medium text-white">Cost by Agent</h2>
          <div className="space-y-3">
            {costByAgent.map((a) => (
              <div key={a.name} className="group cursor-pointer">
                <div className="mb-1 flex items-center justify-between">
                  <span className="truncate text-[11px] text-white/80 transition-colors group-hover:text-white">{a.name}</span>
                  <span className="ml-2 shrink-0 text-[11px] text-white/75">{a.cost}</span>
                </div>
                <div className="h-1 w-full rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-white/10 transition-all group-hover:bg-white/[0.15]" style={{ width: `${a.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latency table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#18181b]">
        <div className="border-b border-white/[0.08] px-5 py-4">
          <h2 className="text-sm font-medium text-white">Latency Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Agent", "P50", "P90", "P99", "Max", "Trend"].map((h, i) => (
                  <th key={h} className={cn("py-3 text-[10px] font-normal uppercase tracking-wider text-white/55",
                    i === 0 ? "px-5 text-left" : "px-4 text-right")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {latencyMetrics.map((row) => (
                <tr key={row.id} className="cursor-default border-b border-white/[0.05] hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white/75">{row.agent_name}</td>
                  <td className="px-4 py-3 text-right text-white/80">{row.p50}</td>
                  <td className="px-4 py-3 text-right text-white/80">{row.p90}</td>
                  <td className="px-4 py-3 text-right text-white/80">{row.p99}</td>
                  <td className="px-4 py-3 text-right text-white/75">{row.max_latency}</td>
                  <td className="px-4 py-3 text-right"><MiniBar data={row.sparkline_data} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: API Keys ────────────────────────────────────────────────────────────

function ApiKeysTab({ apiKeys }: { apiKeys: ApiKey[] }) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied,   setCopied]   = useState<string | null>(null);

  function handleCopy(id: string) {
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const maxCalls = Math.max(...apiKeys.map((k) => k.calls), 1);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="API Keys"
        subtitle="Manage authentication keys for the Rail API."
        action={
          <button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/80">
            <Plus className="h-3.5 w-3.5" /> Create Key
          </button>
        }
      />

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-white/80" />
        <p className="text-xs text-white/75">
          API keys grant full access to your workspace. Never expose them in client-side code or public repositories.
          Rotate keys immediately if you suspect a breach.
        </p>
      </div>

      {/* Keys table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#18181b]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.08]">
                {["Name", "Key", "Scopes", "Last Used", "Created", ""].map((h, i) => (
                  <th key={h + i} className={cn("py-3 text-[10px] font-normal uppercase tracking-wider text-white/55",
                    i === 0 ? "px-5 text-left" : i === 5 ? "w-20 px-4" : i >= 3 ? "px-4 text-right" : "px-4 text-left")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((k) => (
                <tr key={k.id} className="group border-b border-white/[0.05] transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", k.active ? "bg-emerald-500" : "bg-white/10")} />
                      <span className="text-white/80">{k.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-white/75">
                        {revealed === k.id ? `${k.prefix}••••••••••••` : `${k.prefix.slice(0, 12)}••••`}
                      </span>
                      <button onClick={() => setRevealed(revealed === k.id ? null : k.id)}
                        className="cursor-pointer text-white/80 transition-colors hover:text-white/75">
                        {revealed === k.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <span key={s} className={cn("rounded-full px-2 py-0.5 text-[10px]",
                          s === "deploy" ? "bg-white/[0.06] text-white/80" :
                          s === "write"  ? "bg-amber-500/10 text-amber-600/70" :
                                           "bg-white/[0.05] text-white/55")}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-white/75">{timeAgo(k.last_used_at)}</td>
                  <td className="px-4 py-4 text-right text-white/55">{formatDate(k.created_at)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleCopy(k.id)}
                        className="cursor-pointer rounded p-1 text-white/80 transition-colors hover:bg-white/[0.02] hover:text-white/75">
                        {copied === k.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <button className="cursor-pointer rounded p-1 text-white/80 transition-colors hover:bg-red-500/10 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
          <h2 className="mb-4 text-sm font-medium text-white">Key Activity (24h)</h2>
          <div className="space-y-3">
            {apiKeys.filter((k) => k.active).map((k) => {
              const pct = k.calls > 0 ? Math.round((k.calls / maxCalls) * 100) : 0;
              return (
                <div key={k.id} className="group cursor-default">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="truncate text-xs text-white/80">{k.name}</span>
                    <span className="ml-2 shrink-0 text-[10px] text-white/55">{k.calls.toLocaleString()} calls</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/[0.05]">
                    <div className="h-full rounded-full bg-white/40" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
          <h2 className="mb-4 text-sm font-medium text-white">Security Tips</h2>
          <div className="space-y-3">
            {[
              { icon: <RefreshCcw className="h-3.5 w-3.5" />, tip: "Rotate keys every 90 days to reduce exposure window." },
              { icon: <Shield className="h-3.5 w-3.5" />,     tip: "Use scoped keys — grant only the permissions each service needs." },
              { icon: <Terminal className="h-3.5 w-3.5" />,   tip: "Set keys via environment variables, never in source code." },
              { icon: <AlertCircle className="h-3.5 w-3.5" />,tip: "Monitor last-used timestamps for keys you don't recognize." },
            ].map(({ icon, tip }, i) => (
              <div key={i} className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-white/80">{icon}</span>
                <p className="text-xs text-white/75 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-white" : "bg-white/20"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-black shadow transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

// ─── Tab: Settings ────────────────────────────────────────────────────────────

function SettingsTab({ user }: { user: import("@supabase/supabase-js").User | null }) {
  const [fullName, setFullName]           = useState(user?.user_metadata?.full_name ?? "");
  const [email, setEmail]                 = useState(user?.email ?? "");
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [saveError, setSaveError]         = useState<string | null>(null);

  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving]               = useState(false);
  const [pwSaved, setPwSaved]                 = useState(false);
  const [pwError, setPwError]                 = useState<string | null>(null);

  const [copiedAddress, setCopiedAddress]     = useState(false);

  const [notifications, setNotifications] = useState({
    deploys: true, errors: true, billing: false, weekly: true,
  });

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);


  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const updates: Parameters<ReturnType<typeof createClient>["auth"]["updateUser"]>[0] = {
      data: { full_name: fullName },
    };
    if (email !== user?.email) updates.email = email;
    const { error } = await supabase.auth.updateUser(updates);
    if (error) {
      setSaveError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  }

  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    setPwError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwError(error.message);
    } else {
      setPwSaved(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSaved(false), 2500);
    }
    setPwSaving(false);
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Manage workspace preferences and account configuration." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-1 space-y-4 lg:col-span-2">

          {/* General */}
          <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
            <h2 className="mb-4 text-sm font-medium text-white">General</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-white/75">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full cursor-text rounded-lg border border-white/[0.08] bg-[#09090b] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-white/75">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full cursor-text rounded-lg border border-white/[0.08] bg-[#09090b] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30"
                />
                {email !== user?.email && (
                  <p className="mt-1.5 text-[11px] text-white/50">A confirmation link will be sent to the new address.</p>
                )}
              </div>
            </div>
            {saveError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{saveError}</p>
            )}
            <div className="mt-5 flex justify-end border-t border-white/[0.08] pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/80 disabled:opacity-50"
              >
                {saved ? <><Check className="h-3.5 w-3.5" /> Saved</> : saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
            <h2 className="mb-4 text-sm font-medium text-white">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-white/75">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="w-full cursor-text rounded-lg border border-white/[0.08] bg-[#09090b] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-white/75">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  className="w-full cursor-text rounded-lg border border-white/[0.08] bg-[#09090b] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30"
                />
              </div>
            </div>
            {pwError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{pwError}</p>
            )}
            <div className="mt-5 flex justify-end border-t border-white/[0.08] pt-4">
              <button
                onClick={handlePasswordChange}
                disabled={pwSaving || !newPassword}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/80 disabled:opacity-50"
              >
                {pwSaved ? <><Check className="h-3.5 w-3.5" /> Updated</> : pwSaving ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
            <h2 className="mb-4 text-sm font-medium text-white">Notifications</h2>
            <div className="space-y-3">
              {([
                { key: "deploys", label: "Deployment events",  desc: "Agent deploy, rollback, and update notifications" },
                { key: "errors",  label: "Errors and alerts",  desc: "Runtime errors, rate limits, and degraded status" },
                { key: "billing", label: "Billing updates",    desc: "Invoice generation and spending threshold alerts" },
                { key: "weekly",  label: "Weekly digest",      desc: "Summary of usage, cost, and performance trends" },
              ] as const).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-white/[0.08] px-4 py-3">
                  <div>
                    <p className="text-sm text-white/80">{label}</p>
                    <p className="text-[11px] text-white/55">{desc}</p>
                  </div>
                  <Toggle
                    checked={notifications[key]}
                    onChange={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* USDC Balance */}
          <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">USDC Balance</h2>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600">Solana</span>
            </div>

            {/* Balance display */}
            <div className="flex items-end justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Available Balance</p>
                <p className="text-3xl font-light text-white tracking-tight">0.00</p>
                <p className="text-xs text-white/50 mt-0.5">USDC</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Spent this month</p>
                <p className="text-sm text-white">0.00 USDC</p>
                <p className="text-[10px] text-white/40 mt-0.5">~0.00 / day</p>
              </div>
            </div>

            {/* Burn rate bar */}
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] text-white/50">Monthly usage</span>
                <span className="text-[10px] text-white/50">0.00 / 0.00 USDC</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-black" style={{ width: "0" }} />
              </div>
            </div>

            {/* Recent deposits */}
            <div className="mt-4">
              <p className="mb-2 text-[10px] uppercase tracking-wider text-white/50">Recent deposits</p>
              <div className="space-y-1">
                {[
                ].map(({ amount, date, tx }) => (
                  <div key={tx} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/[0.02]">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                        <ArrowUpRight className="h-2.5 w-2.5 text-emerald-600 rotate-180" />
                      </span>
                      <div>
                        <p className="text-xs text-white">{amount} USDC</p>
                        <p className="text-[10px] text-white/40">{date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-white/40">{tx}</span>
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-600">Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-5">
            <h2 className="mb-1 text-sm font-medium text-red-600">Danger Zone</h2>
            <p className="mb-4 text-xs text-white/55">These actions are permanent and cannot be undone.</p>
            <div className="space-y-2">
              {[
                { label: "Reset all API keys",     desc: "Revokes all existing keys immediately." },
                { label: "Delete all deployments", desc: "Stops and removes all running agents." },
                { label: "Delete workspace",       desc: "Permanently deletes all data." },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-red-500/10 bg-red-500/[0.03] px-4 py-3">
                  <div>
                    <p className="text-xs text-white/80">{label}</p>
                    <p className="text-[10px] text-white/80">{desc}</p>
                  </div>
                  <button className="cursor-pointer rounded-lg border border-red-500/30 px-3 py-1.5 text-[11px] text-red-600/70 transition-colors hover:border-red-500/60 hover:text-red-600">
                    {label.split(" ")[0]}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: New Deployment ────────────────────────────────────────────────────

function NewDeploymentModal({ onClose, onDeployed }: { onClose: () => void; onDeployed: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);
  const [form, setForm] = useState({
    name:         "",
    model:        "claude-sonnet-4-6",
    env:          "production",
    description:  "",
    caching:      true,
    retries:      "3",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Deployment name is required.";
    return e;
  }

  async function handleDeploy() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErrors({ name: "You must be signed in to deploy." });
      setSubmitting(false);
      return;
    }

    const newId = `dep_${Date.now().toString(36).toUpperCase()}`;

    const { error: insertError } = await supabase.from("deployments").insert({
      id:       newId,
      user_id:  user.id,
      name:     form.name.trim(),
      model:    form.model,
      env:      form.env,
      status:   "active",
      requests: 0,
      latency:  "—",
    });

    if (insertError) {
      setErrors({ name: insertError.message });
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setDone(true);
    onDeployed();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-xl border border-white/[0.08] bg-[#18181b] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div>
            <h2 className="text-sm font-medium text-white">New Deployment</h2>
            <p className="mt-0.5 text-xs text-white/75">Configure and deploy your agent.</p>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-white/55 transition-colors hover:bg-white/[0.02] hover:text-white/80">
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          /* Success state */
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Deployment initiated</p>
              <p className="mt-1 text-xs text-white/75">
                <span className="font-mono text-white/80">{form.name}</span> is spinning up on{" "}
                <span className="text-white/80">{form.env}</span>.
              </p>
            </div>
            <p className="text-[11px] text-white/80">Usually ready in under 30 seconds.</p>
            <button onClick={onClose}
              className="mt-2 cursor-pointer rounded-full bg-white px-5 py-2 text-xs font-medium text-black transition-colors hover:bg-white/80">
              Done
            </button>
          </div>
        ) : (
          /* Single-step form */
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-4 px-6 py-5">

              {/* Name */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs text-white/75">
                  Deployment Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. research-agent-v3"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={cn(
                    "w-full cursor-text rounded-lg border bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors",
                    errors.name ? "border-red-500/60 focus:border-red-500/80" : "border-white/[0.08] focus:border-white/30"
                  )}
                />
                {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>}
              </div>

              {/* Environment */}
              <div>
                <label className="mb-1.5 block text-xs text-white/75">Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  {["production", "staging"].map((e) => (
                    <button key={e} type="button"
                      onClick={() => setForm((f) => ({ ...f, env: e }))}
                      className={cn(
                        "cursor-pointer rounded-lg border py-2.5 text-xs capitalize transition-all",
                        form.env === e
                          ? "border-white/30 bg-white/[0.04] text-white"
                          : "border-white/[0.08] text-white/75 hover:border-white/20 hover:text-white/80"
                      )}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model */}
              <div>
                <label className="mb-1.5 block text-xs text-white/75">Model</label>
                <div className="grid grid-cols-3 gap-2">
                  {["claude-haiku-4-5", "claude-sonnet-4-6", "claude-opus-4-7"].map((m) => (
                    <button key={m} type="button"
                      onClick={() => setForm((f) => ({ ...f, model: m }))}
                      className={cn(
                        "cursor-pointer rounded-lg border px-2 py-2.5 font-mono text-[10px] transition-all",
                        form.model === m
                          ? "border-white/30 bg-white/[0.04] text-white"
                          : "border-white/[0.08] text-white/55 hover:border-white/20 hover:text-white/75"
                      )}>
                      {m.replace("claude-", "").replace("-4-", " 4.")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs text-white/75">Description <span className="text-white/40">(optional)</span></label>
                <textarea
                  rows={2}
                  placeholder="What does this deployment do?"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full cursor-text resize-none rounded-lg border border-white/[0.08] bg-[#18181b]/[0.03] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30"
                />
              </div>

              {/* Prompt caching toggle */}
              <div className="flex items-center justify-between rounded-lg border border-white/[0.08] px-4 py-3">
                <div>
                  <p className="text-xs text-white/75">Prompt caching</p>
                  <p className="text-[10px] text-white/55">Cache repeated prompt prefixes to reduce latency and cost.</p>
                </div>
                <Toggle checked={form.caching} onChange={() => setForm((f) => ({ ...f, caching: !f.caching }))} />
              </div>

              {/* Max retries */}
              <div>
                <label className="mb-1.5 block text-xs text-white/75">Max Retries on Failure</label>
                <select
                  value={form.retries}
                  onChange={(e) => setForm((f) => ({ ...f, retries: e.target.value }))}
                  className="w-full cursor-pointer rounded-lg border border-white/[0.08] bg-[#09090b] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-white/30">
                  {["0", "1", "2", "3", "4", "5"].map((v) => (
                    <option key={v} value={v}>{v === "0" ? "0 — no retries" : `${v} retr${v === "1" ? "y" : "ies"}`}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        )}

        {/* Footer */}
        {!done && (
          <div className="flex items-center justify-between border-t border-white/[0.08] px-6 py-4">
            <button
              onClick={onClose}
              className="cursor-pointer text-xs text-white/55 transition-colors hover:text-white/80">
              Cancel
            </button>
            <button
              onClick={handleDeploy}
              disabled={submitting}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting
                ? <><RefreshCcw className="h-3.5 w-3.5 animate-spin" /> Deploying…</>
                : <><Rocket className="h-3.5 w-3.5" /> Deploy</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal: New Agent ────────────────────────────────────────────────────────

function NewAgentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);
  const [form, setForm] = useState({
    name:        "",
    model:       "claude-sonnet-4-6",
    description: "",
    tags:        "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Agent name is required.";
    return e;
  }

  async function handleCreate() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErrors({ name: "You must be signed in to create an agent." });
      setSubmitting(false);
      return;
    }

    const newId   = `agt_${Date.now().toString(36).toUpperCase()}`;
    const tagList = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    const { error: insertError } = await supabase.from("agents").insert({
      id:          newId,
      user_id:     user.id,
      name:        form.name.trim(),
      model:       form.model,
      description: form.description.trim(),
      tags:        tagList,
      status:      "active",
      requests:    0,
      latency:     "—",
      cache_hit:   "—",
      cost:        0,
    });

    if (insertError) {
      setErrors({ name: insertError.message });
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setDone(true);
    onCreated();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg rounded-xl border border-white/[0.08] bg-[#18181b] shadow-2xl">

        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div>
            <h2 className="text-sm font-medium text-white">New Agent</h2>
            <p className="mt-0.5 text-xs text-white/75">Configure and register your agent.</p>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-white/55 transition-colors hover:bg-white/[0.02] hover:text-white/80">
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Agent created</p>
              <p className="mt-1 text-xs text-white/75">
                <span className="font-mono text-white/80">{form.name}</span> is now registered and active.
              </p>
            </div>
            <button onClick={onClose}
              className="mt-2 cursor-pointer rounded-full bg-white px-5 py-2 text-xs font-medium text-black transition-colors hover:bg-white/80">
              Done
            </button>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-4 px-6 py-5">

              {/* Name */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs text-white/75">
                  Agent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. research-agent-v3"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={cn(
                    "w-full cursor-text rounded-lg border bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors",
                    errors.name ? "border-red-500/60 focus:border-red-500/80" : "border-white/[0.08] focus:border-white/30"
                  )}
                />
                {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>}
              </div>

              {/* Model */}
              <div>
                <label className="mb-1.5 block text-xs text-white/75">Model</label>
                <div className="grid grid-cols-3 gap-2">
                  {["claude-haiku-4-5", "claude-sonnet-4-6", "claude-opus-4-7"].map((m) => (
                    <button key={m} type="button"
                      onClick={() => setForm((f) => ({ ...f, model: m }))}
                      className={cn(
                        "cursor-pointer rounded-lg border px-2 py-2.5 font-mono text-[10px] transition-all",
                        form.model === m
                          ? "border-white/30 bg-white/[0.04] text-white"
                          : "border-white/[0.08] text-white/55 hover:border-white/20 hover:text-white/75"
                      )}>
                      {m.replace("claude-", "").replace("-4-", " 4.")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs text-white/75">Description <span className="text-white/40">(optional)</span></label>
                <textarea
                  rows={2}
                  placeholder="What does this agent do?"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full cursor-text resize-none rounded-lg border border-white/[0.08] bg-[#18181b]/[0.03] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="mb-1.5 block text-xs text-white/75">Tags <span className="text-white/40">(optional, comma-separated)</span></label>
                <input
                  type="text"
                  placeholder="e.g. research, synthesis"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="w-full cursor-text rounded-lg border border-white/[0.08] bg-[#18181b]/[0.03] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30"
                />
              </div>

            </div>
          </div>
        )}

        {!done && (
          <div className="flex items-center justify-between border-t border-white/[0.08] px-6 py-4">
            <button onClick={onClose} className="cursor-pointer text-xs text-white/55 transition-colors hover:text-white/80">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting
                ? <><RefreshCcw className="h-3.5 w-3.5 animate-spin" /> Creating…</>
                : <><Bot className="h-3.5 w-3.5" /> Create Agent</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const navItems: { id: string; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "overview",    label: "Overview",    icon: LayoutDashboard },
  { id: "agents",      label: "Agents",      icon: Bot },
  { id: "deployments", label: "Deployments", icon: Rocket },
  { id: "analytics",   label: "Analytics",   icon: BarChart3 },
  { id: "api-keys",    label: "API Keys",    icon: Key },
  { id: "settings",    label: "Settings",    icon: Settings },
];

const topbarCTA: Record<string, string> = {
  overview:    "New Deployment",
  agents:      "New Agent",
  deployments: "New Deployment",
  analytics:   "Export CSV",
  "api-keys":  "Create Key",
  settings:    "Save Changes",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [activeNav,       setActiveNav]       = useState("overview");
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [agentModalOpen,  setAgentModalOpen]  = useState(false);
  const [loading,         setLoading]         = useState(true);

  const [user,           setUser]           = useState<User | null>(null);
  const [agents,         setAgents]         = useState<Agent[]>([]);
  const [deployments,    setDeployments]    = useState<Deployment[]>([]);
  const [apiKeys,        setApiKeys]        = useState<ApiKey[]>([]);
  const [activityFeed,   setActivityFeed]   = useState<ActivityEvent[]>([]);
  const [systemServices, setSystemServices] = useState<SystemService[]>([]);
  const [hourlyMetrics,  setHourlyMetrics]  = useState<HourlyMetric[]>([]);
  const [latencyMetrics, setLatencyMetrics] = useState<LatencyMetric[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function fetchAll() {
      setLoading(true);
      const [
        authResult,
        agentsResult,
        deploymentsResult,
        apiKeysResult,
        activityResult,
        servicesResult,
        metricsResult,
        latencyResult,
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("agents").select("*").order("requests", { ascending: false }),
        supabase.from("deployments").select("*").order("created_at", { ascending: false }),
        supabase.from("api_keys").select("*").order("created_at", { ascending: false }),
        supabase.from("activity_events").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("system_services").select("*"),
        supabase.from("hourly_metrics").select("*").order("hour_index", { ascending: true }).limit(24),
        supabase.from("latency_metrics").select("*"),
      ]);

      setUser(authResult.data.user);
      if (agentsResult.data)      setAgents(agentsResult.data as Agent[]);
      if (deploymentsResult.data) setDeployments(deploymentsResult.data as Deployment[]);
      if (apiKeysResult.data)     setApiKeys(apiKeysResult.data as ApiKey[]);
      if (activityResult.data)    setActivityFeed(activityResult.data as ActivityEvent[]);
      if (servicesResult.data)    setSystemServices(servicesResult.data as SystemService[]);
      if (metricsResult.data)     setHourlyMetrics(metricsResult.data as HourlyMetric[]);
      if (latencyResult.data)     setLatencyMetrics(latencyResult.data as LatencyMetric[]);

      setLoading(false);
    }

    fetchAll();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
  };

  async function refetchDeployments() {
    const supabase = createClient();
    const { data } = await supabase
      .from("deployments")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setDeployments(data as Deployment[]);
  }

  const openDeployModal  = () => setDeployModalOpen(true);
  const closeDeployModal = () => setDeployModalOpen(false);

  async function refetchAgents() {
    const supabase = createClient();
    const { data } = await supabase.from("agents").select("*").order("requests", { ascending: false });
    if (data) setAgents(data as Agent[]);
  }

  const openAgentModal  = () => setAgentModalOpen(true);
  const closeAgentModal = () => setAgentModalOpen(false);

  const deployTabs = new Set(["overview", "deployments"]);

  // Update agents badge to reflect live count
  const agentsBadge = agents.length > 0 ? String(agents.length) : undefined;

  const tabContent: Record<string, React.ReactNode> = {
    overview:    <OverviewTab agents={agents} deployments={deployments} activityFeed={activityFeed} systemServices={systemServices} hourlyMetrics={hourlyMetrics} />,
    agents:      <AgentsTab agents={agents} onNewAgent={openAgentModal} />,
    deployments: <DeploymentsTab deployments={deployments} onNewDeployment={openDeployModal} />,
    analytics:   <AnalyticsTab agents={agents} hourlyMetrics={hourlyMetrics} latencyMetrics={latencyMetrics} />,
    "api-keys":  <ApiKeysTab apiKeys={apiKeys} />,
    settings:    <SettingsTab user={user} />,
  };

  return (
    <div className="dashboard flex min-h-screen flex-col bg-[#09090b] font-mono text-white">

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.08] bg-[#111117] px-4 md:gap-3 md:px-5">
        {/* Logo + brand */}
        <div className="flex shrink-0 items-center gap-2.5 border-r border-white/[0.08] pr-3 md:pr-4">
          <Image src="/images/logo-transparent.png" alt="Maxim Protocol" width={50} height={50} className="h-7 w-7 object-contain object-left" priority />
          <span className="hidden text-sm font-medium tracking-tight text-white sm:inline">Maxim Protocol</span>
        </div>

        {/* Nav items — icons-only on mobile, icons+labels on sm+ */}
        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveNav(id)}
              className={cn("flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-all sm:px-3",
                activeNav === id ? "bg-white/[0.07] text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white/80")}>
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
              {id === "agents" && agentsBadge && (
                <span className="rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[10px] text-white/75">{agentsBadge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Right controls */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-2">
          {/* Search bar — hidden on small screens */}
          <div className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-[#18181b] px-3 py-1.5 md:flex">
            <Search className="h-3.5 w-3.5 shrink-0 text-white/55" />
            <input type="text" placeholder="Search agents, deployments..."
              className="w-36 cursor-text bg-transparent text-xs text-white placeholder-white/30 outline-none lg:w-44" />
            <kbd className="shrink-0 rounded border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-white/80">⌘K</kbd>
          </div>
          {/* Search icon — mobile only */}
          <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] text-white/75 transition-all hover:bg-white/[0.02] md:hidden">
            <Search className="h-3.5 w-3.5" />
          </button>

          <button className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] text-white/75 transition-all hover:bg-white/[0.02] hover:text-white/75">
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-black" />
          </button>
          <button className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] text-white/75 transition-all hover:bg-white/[0.02] hover:text-white/75 sm:flex">
            <RefreshCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={activeNav === "agents" ? openAgentModal : deployTabs.has(activeNav) ? openDeployModal : undefined}
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/90 sm:px-3">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{topbarCTA[activeNav]}</span>
          </button>

          {/* User */}
          <div className="flex items-center gap-2 border-l border-white/[0.08] pl-2 md:pl-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
              <span className="text-[10px] font-medium text-white">
                {(user?.user_metadata?.full_name ?? user?.email ?? "?")[0].toUpperCase()}
              </span>
            </div>
            <div className="hidden min-w-0 xl:block">
              <p className="max-w-[120px] truncate text-[11px] text-white/75">
                {user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "—"}
              </p>
            </div>
            <button onClick={handleSignOut} title="Sign out"
              className="flex cursor-pointer items-center justify-center rounded-md p-1.5 text-white/40 transition-all hover:bg-white/[0.04] hover:text-white/75">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCcw className="h-5 w-5 animate-spin text-white/30" />
          </div>
        ) : (
          tabContent[activeNav]
        )}
      </main>

      {deployModalOpen && <NewDeploymentModal onClose={closeDeployModal} onDeployed={refetchDeployments} />}
      {agentModalOpen  && <NewAgentModal onClose={closeAgentModal} onCreated={refetchAgents} />}
    </div>
  );
}
