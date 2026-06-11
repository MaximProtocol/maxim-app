# Maxim Protocol

**The cohesive payment infrastructure for autonomous AI agents.**

One API. Any protocol. Every transaction on-chain.

---

## What it is

AI agents are spending money at scale: renting compute, calling APIs, hiring sub-agents, hundreds of millions of times per month. The infrastructure to support this is fragmented, protocol-locked, and largely opaque.

Maxim Protocol is the unified payment layer for AI agents. It abstracts both x402 and MPP behind a single developer interface, settles every transaction on Solana, and makes every payment verifiable on-chain in real time. Agents get wallets. Developers get one SDK. Finance teams get a ledger they can actually audit.

---

## The problem

Two machine payment protocols emerged in 2025–2026:

- **x402** (Coinbase): HTTP-native, embeds payment handshakes in request/response cycles using the HTTP 402 status code. Blockchain-native, USDC-settled, zero protocol fees.
- **MPP** (Stripe + Tempo): purpose-built agent payment protocol, submitted as an IETF Standards Track draft. Multi-rail. Native session support. Already integrated by OpenAI, Anthropic, Google Gemini, and 50+ services at launch.

Neither protocol is going away. This creates real problems for agent developers:

- An agent built for x402 cannot pay MPP-gated services without rewriting payment logic
- No unified wallet primitive across protocols
- Off-chain rails offer no transparent transaction record
- Spend controls (budget caps, allowlists, per-agent limits) must be built from scratch
- When Agent A hires Agent B, that payment chain is entirely untracked

Maxim Protocol solves these at the infrastructure level.

---

## Core features

### Agent wallets
Every agent provisioned through Maxim Protocol receives a Solana wallet (a Program Derived Address scoped to the agent's ID). Fund it, query the balance, and settle payments through a single consistent API with no separate key management infrastructure required.

### Protocol routing
A single call to `maxim.pay()` handles both x402 and MPP automatically. Protocol detection, session management, and signed payload construction are resolved at the gateway. Your application writes one line of code.

### Spend controls
Per-agent budget caps, domain allowlists, rate limits, and per-call ceilings are evaluated before any transaction is submitted to the network. Requests that breach a policy are rejected at the gateway, not after funds are committed.

### On-chain by default
Every transaction settles on Solana with a public transaction signature, regardless of which underlying protocol was used. There is no secondary ledger or off-chain reconciliation layer. The blockchain is the record.

### Multi-agent payment chains
When an orchestrator delegates to sub-agents, the full payment hierarchy is recorded on Solana with linked transaction references at each node. Every spend is attributable, auditable, and queryable without a separate accounting layer.

---

## Why Solana

| Property | Value |
|---|---|
| Transaction fee | < $0.001 (typically $0.00025) |
| Finality | < 1000ms today |
| Daily transaction volume | 143M (May 2026) |
| Stablecoin throughput | $2T per quarter |
| Throughput | 65,000 TPS theoretical |

Solana's fee-per-account-state model means fees scale by contention on specific state rather than globally, making it ideal for parallel agent workloads where many agents transact independently.

---

## Competitive position

| | **Maxim Protocol** | x402 direct | MPP direct | AWS AgentCore |
|---|---|---|---|---|
| Protocol support | x402 + MPP | x402 only | MPP only | x402 + Stripe |
| Settlement | Solana (on-chain) | On-chain | Off-chain | USDC |
| On-chain transparency | Full | Partial | None | Partial |
| Spend policies | Built-in | DIY | DIY | Limited |
| Agent wallets | Built-in | DIY | N/A | Built-in |
| Multi-agent accounting | Built-in | None | None | None |
| Protocol fee | None | None | Stripe % | Unknown |

---

## Stack

This repository is the Maxim Protocol marketing site and developer dashboard.

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Auth + database | [Supabase](https://supabase.com) |
| Settlement layer | [Solana](https://solana.com) |
| UI components | shadcn/ui |

---

## Links

- Site: [maximprotocol.com](https://maximprotocol.com)
- Docs: [docs.maximprotocol.com](https://docs.maximprotocol.com)
- X: [@maximprotocol](https://x.com/maximprotocol)
- GitHub: [github.com/maximprotocol](https://github.com/maximprotocol)
