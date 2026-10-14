"use client";

import { Card, CardContent, LineChart } from "@geistloom/ui";
import { CalendarClock, HeartPulse, Leaf, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

/** Minimal shape emitted by GET /api/stream. */
interface StreamEvent {
  readonly year: number;
  readonly lifeExpectancy: number;
  readonly population: number;
  readonly biosphereHealth: number;
}

function isStreamEvent(value: unknown): value is StreamEvent {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.year === "number" &&
    typeof candidate.lifeExpectancy === "number" &&
    typeof candidate.population === "number" &&
    typeof candidate.biosphereHealth === "number"
  );
}

const BUFFER_LIMIT = 30;

export function MetricCards() {
  const [latest, setLatest] = useState<StreamEvent | null>(null);
  const [buffer, setBuffer] = useState<readonly StreamEvent[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const source = new EventSource("/api/stream");
    const onMessage = (event: MessageEvent<string>): void => {
      try {
        const parsed: unknown = JSON.parse(event.data);
        if (!isStreamEvent(parsed)) return;
        setLatest(parsed);
        setBuffer((prev) => [...prev.slice(-(BUFFER_LIMIT - 1)), parsed]);
        setLive(true);
      } catch {
        // Malformed frame — ignore.
      }
    };
    const onError = (): void => setLive(false);
    source.addEventListener("message", onMessage);
    source.addEventListener("error", onError);
    return () => {
      source.removeEventListener("message", onMessage);
      source.removeEventListener("error", onError);
      source.close();
    };
  }, []);

  const lifeExpectancyPoints = buffer.map((event) => event.lifeExpectancy);
  const lifeExpectancyLabels = buffer.map((event) => event.year);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <span
          className={
            live
              ? "inline-block h-2 w-2 animate-pulse rounded-full bg-bio-teal"
              : "inline-block h-2 w-2 rounded-full bg-mist/50"
          }
        />
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-mist">
          {live ? "live" : "connecting"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<HeartPulse className="h-4 w-4" />}
          label="Life expectancy"
          value={latest ? `${latest.lifeExpectancy.toFixed(1)} yrs` : "—"}
        />
        <MetricCard
          icon={<Users className="h-4 w-4" />}
          label="Population"
          value={latest ? `${latest.population.toFixed(2)} bn` : "—"}
        />
        <MetricCard
          icon={<Leaf className="h-4 w-4" />}
          label="Biosphere health"
          value={latest ? `${latest.biosphereHealth.toFixed(1)} / 100` : "—"}
        />
        <MetricCard
          icon={<CalendarClock className="h-4 w-4" />}
          label="Year"
          value={latest ? `${latest.year}` : "—"}
        />
      </div>

      <Card>
        <CardContent className="pt-5">
          {buffer.length === 0 ? (
            <p className="py-8 text-center font-mono text-sm text-mist">awaiting stream…</p>
          ) : (
            <LineChart
              series={[
                {
                  label: "Life expectancy (live)",
                  points: lifeExpectancyPoints,
                },
              ]}
              labels={lifeExpectancyLabels}
              height={180}
              yLabel="years"
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5 pt-5">
        <div className="flex items-center gap-2 text-bio-teal">
          {icon}
          <span className="font-mono text-[11px] uppercase tracking-wider text-mist">{label}</span>
        </div>
        <span className="font-display text-3xl font-semibold tracking-tight text-star-white">
          {value}
        </span>
      </CardContent>
    </Card>
  );
}
