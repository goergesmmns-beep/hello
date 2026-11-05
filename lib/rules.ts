import type { Gate, Listing } from "@/content/listings";
import { getSetting, setSetting } from "./store";

type Rule = { gate: Gate; floorUsd: number | null };
export async function allRules() { return (await getSetting<Record<string, Rule>>("rules")) ?? {}; }
export async function ruleFor(l: Listing): Promise<Rule> { return (await allRules())[l.slug] ?? { gate: l.gate, floorUsd: l.floorUsd }; }
export async function saveRule(slug: string, r: Rule) { await setSetting("rules", { ...(await allRules()), [slug]: r }); }
