"use client";

import { Button } from "@geistloom/ui";
import { useRouter } from "next/navigation";

/**
 * Per-card link: run this future in the Century Engine
 * (/century?scenario=<id>). Client component because navigation
 * is the interaction.
 */
export function ScenarioRunLink({ scenarioId }: { readonly scenarioId: string }) {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => router.push(`/century?scenario=${scenarioId}`)}
    >
      Run this future
    </Button>
  );
}
