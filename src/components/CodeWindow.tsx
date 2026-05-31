"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["TypeScript", "Python", "cURL"] as const;
type Tab = (typeof TABS)[number];

// ── Syntax token helpers ──────────────────────────────────────────────────────
function Kw({ c }: { c: string })   { return <span className="text-[#93c5fd]">{c}</span>; }
function Str({ c }: { c: string })  { return <span className="text-[#86efac]">{c}</span>; }
function Cls({ c }: { c: string })  { return <span className="text-[#c4b5fd]">{c}</span>; }
function Fn({ c }: { c: string })   { return <span className="text-[#fde68a]">{c}</span>; }
function Prop({ c }: { c: string }) { return <span className="text-[#7dd3fc]">{c}</span>; }

// ── Code blocks ───────────────────────────────────────────────────────────────
function TypeScriptCode() {
  return (
    <>
      <Kw c="const" />{" response = "}<Kw c="await" />{" "}<Fn c="fetch" />{"(\n"}
      {"  "}<Str c='"https://api.maximprotocol.com/v1/pay"' />{",\n"}
      {"  {\n"}
      {"    method: "}<Str c='"POST"' />{",\n"}
      {"    headers: {\n"}
      {"      "}<Str c='"Authorization"' />{": "}<Str c="`Bearer ${" />
      <Prop c="process" />{"."}<Prop c="env" />{"."}<Prop c="MAXIM_API_KEY" />
      <Str c="}`" />{",\n"}
      {"      "}<Str c='"Content-Type"' />{": "}<Str c='"application/json"' />{",\n"}
      {"    },\n"}
      {"    body: "}<Cls c="JSON" />{"."}<Fn c="stringify" />({"{\n"}
      {"      agentId:  "}<Str c='"my-agent"' />{",\n"}
      {"      endpoint: "}<Str c='"https://api.dune.com/v1/query/1234/results"' />{",\n"}
      {"      method:   "}<Str c='"GET"' />{",\n"}
      {"    }),\n"}
      {"  }\n"}
      {");\n"}
      {"\n"}
      <Kw c="const" />{" data = "}<Kw c="await" />{" response."}<Fn c="json" />();
    </>
  );
}

function PythonCode() {
  return (
    <>
      <Kw c="import" />{" os\n"}
      <Kw c="import" />{" requests\n"}
      {"\n"}
      {"response = requests."}<Fn c="post" />{"(\n"}
      {"    "}<Str c='"https://api.maximprotocol.com/v1/pay"' />{",\n"}
      {"    headers={\n"}
      {"        "}<Str c='"Authorization"' />{": "}<Fn c="f" /><Str c='"Bearer {os.environ[' /><Str c="'MAXIM_API_KEY'" /><Str c='"]}"' />{",\n"}
      {"        "}<Str c='"Content-Type"' />{": "}<Str c='"application/json"' />{",\n"}
      {"    },\n"}
      {"    json={\n"}
      {"        "}<Str c='"agentId"' />{":  "}<Str c='"my-agent"' />{",\n"}
      {"        "}<Str c='"endpoint"' />{": "}<Str c='"https://api.dune.com/v1/query/1234/results"' />{",\n"}
      {"        "}<Str c='"method"' />{":   "}<Str c='"GET"' />{",\n"}
      {"    },\n"}
      {")\n"}
      {"\n"}
      {"data = response."}<Fn c="json" />()
    </>
  );
}

function CurlCode() {
  return (
    <>
      {"curl -X "}<Fn c="POST" />{" "}<Str c="https://api.maximprotocol.com/v1/pay" />{" \\\n"}
      {"  -H "}<Str c='"Authorization: Bearer $MAXIM_API_KEY"' />{" \\\n"}
      {"  -H "}<Str c='"Content-Type: application/json"' />{" \\\n"}
      {"  -d '{\n"}
      {"    "}<Prop c='"agentId"' />{":  "}<Str c='"my-agent"' />{",\n"}
      {"    "}<Prop c='"endpoint"' />{": "}<Str c='"https://api.dune.com/v1/query/1234/results"' />{",\n"}
      {"    "}<Prop c='"method"' />{":   "}<Str c='"GET"' />{"\n"}
      {"  }'"}
    </>
  );
}

// ── Plain-text copies ─────────────────────────────────────────────────────────
const rawCode: Record<Tab, string> = {
  TypeScript: `const response = await fetch(
  "https://api.maximprotocol.com/v1/pay",
  {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.MAXIM_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agentId:  "my-agent",
      endpoint: "https://api.dune.com/v1/query/1234/results",
      method:   "GET",
    }),
  }
);

const data = await response.json();`,
  Python: `import os
import requests

response = requests.post(
    "https://api.maximprotocol.com/v1/pay",
    headers={
        "Authorization": f"Bearer {os.environ['MAXIM_API_KEY']}",
        "Content-Type": "application/json",
    },
    json={
        "agentId":  "my-agent",
        "endpoint": "https://api.dune.com/v1/query/1234/results",
        "method":   "GET",
    },
)

data = response.json()`,
  cURL: `curl -X POST https://api.maximprotocol.com/v1/pay \\
  -H "Authorization: Bearer $MAXIM_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId":  "my-agent",
    "endpoint": "https://api.dune.com/v1/query/1234/results",
    "method":   "GET"
  }'`,
};

// ── Main component ────────────────────────────────────────────────────────────
export function CodeWindow() {
  const [tab, setTab] = useState<Tab>("TypeScript");
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(rawCode[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl">
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#161b22] px-4 py-3">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1 text-[11px] transition-colors",
                tab === t
                  ? "bg-white/10 text-white"
                  : "text-white/35 hover:text-white/60"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Copy */}
        <button
          onClick={handleCopy}
          className="flex cursor-pointer items-center gap-1.5 text-white/35 transition-colors hover:text-white/65"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body — fixed height so switching tabs doesn't resize the window */}
      <div className="overflow-auto p-5" style={{ height: "500px" }}>
        <pre className="font-mono text-[13px] leading-[1.7] text-white/70">
          {tab === "TypeScript" && <TypeScriptCode />}
          {tab === "Python"     && <PythonCode />}
          {tab === "cURL"       && <CurlCode />}
        </pre>
      </div>
    </div>
  );
}
