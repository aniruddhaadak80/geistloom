"use client";

import type { OraclePlan } from "@geistloom/core";
import { Button } from "@geistloom/ui";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, Check, Link2, Loader2, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { BrainTrace } from "./brain-trace";
import { PhaseAccordion } from "./phase-accordion";
import { PlanDisplay } from "./plan-display";
import { ReasoningDag } from "./reasoning-dag";

const DEFAULT_PROMPT = "solve aging";

/**
 * The flagship console. Large textarea + seed input; on submit it
 * POSTs to /api/oracle and renders the returned plan: summary card,
 * six-phase accordion, reasoning DAG, brain trace, and citations.
 */
export function OracleConsole() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? DEFAULT_PROMPT;
  const [prompt, setPrompt] = useState(initialPrompt);
  const [seedInput, setSeedInput] = useState("");
  const [plan, setPlan] = useState<OraclePlan | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: async (input: { readonly prompt: string; readonly seed?: number }) => {
      const response = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `The Oracle refused (HTTP ${response.status})`);
      }
      return (await response.json()) as OraclePlan;
    },
    onSuccess: (data) => setPlan(data),
  });

  function shareUrl(): string {
    const url = new URL("/oracle", window.location.origin);
    url.searchParams.set("prompt", prompt.trim());
    return url.toString();
  }

  async function handleShare() {
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this plan link:", url);
    }
    // Keep the address bar in sync so a refresh replays the same prompt.
    window.history.replaceState(null, "", `/oracle?prompt=${encodeURIComponent(prompt.trim())}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (trimmed.length === 0 || mutation.isPending) return;
    const parsedSeed = seedInput.trim() === "" ? undefined : Number.parseInt(seedInput, 10);
    mutation.mutate({
      prompt: trimmed,
      seed:
        parsedSeed !== undefined && Number.isInteger(parsedSeed) && parsedSeed >= 0
          ? parsedSeed
          : undefined,
    });
  }

  return (
    <div className="flex flex-col gap-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label
          htmlFor="oracle-prompt"
          className="font-mono text-xs uppercase tracking-[0.25em] text-bio-teal"
        >
          Consult the Oracle
        </label>
        <textarea
          id="oracle-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder='Ask anything — e.g. "solve aging"'
          rows={4}
          className="w-full resize-y rounded-xl border border-charcoal bg-abyss-2 p-4 font-body text-base text-star-white placeholder:text-mist/60 focus:border-bio-teal focus:outline-none focus:ring-1 focus:ring-bio-teal"
        />
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={0}
            value={seedInput}
            onChange={(event) => setSeedInput(event.target.value)}
            placeholder="seed (optional)"
            className="w-44 rounded-lg border border-charcoal bg-abyss-2 px-3 py-2 font-mono text-sm text-star-white placeholder:text-mist/60 focus:border-bio-teal focus:outline-none"
          />
          <Button
            type="submit"
            size="lg"
            disabled={mutation.isPending || prompt.trim().length === 0}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Consulting…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden />
                Consult the Oracle
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => void handleShare()}
            disabled={prompt.trim().length === 0}
            aria-label="Copy a shareable link to this prompt"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden />
                Link copied
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" aria-hidden />
                Share this prompt
              </>
            )}
          </Button>
        </div>
        {mutation.isError && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
            {mutation.error?.message}
          </p>
        )}
      </form>

      {plan && (
        <div className="flex flex-col gap-12">
          <PlanDisplay plan={plan} />
          <PhaseAccordion phases={plan.phases} />
          <ReasoningDag dag={plan.reasoningDag} />
          <BrainTrace prompt={plan.prompt} />
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold">Citations</h2>
            <ul className="flex flex-col gap-2">
              {plan.citations.map((citation) => (
                <li
                  key={citation}
                  className="flex items-start gap-2.5 rounded-lg border border-charcoal bg-abyss-2 p-3 text-sm leading-relaxed text-mist"
                >
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-bio-teal" aria-hidden />
                  <span>{citation}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
