# Engine: The gene drive

The gene-drive engine is a three-allele recursion — wild (**w**), drive
(**d**), resistant (**r**) — simulated generation by generation. It answers
one question: *what happens if this construct escapes?*

## The recursion

Each generation, Hardy–Weinberg heterozygotes form and the drive converts:

```
heterozygote = 2 · w · d
conversions  = min(driveEfficiency · heterozygote, w)        // mass-conserving cap
resistance   = resistanceRate · conversions
w' = w − conversions
d' = d + conversions − resistance
r' = r + resistance
```

Then selection against drive homozygotes renormalizes the three frequencies.

The conversion cap is load-bearing. Without it the recursion can convert more
wild alleles than exist, frequencies leave the simplex, and every downstream
statistic is garbage. A regression test asserts `w + d + r = 1` to 1e-6 on
every generation of a 50-generation run; the same cap exists in the TypeScript,
Rust, and Python mirrors.

## Parameters

| Parameter | Default | Meaning |
| --- | --- | --- |
| `driveEfficiency` | 0.95 | homing rate in heterozygotes |
| `resistanceRate` | 0.02 | fraction of cleavages that yield resistant alleles |
| `fitnessCost` | 0.05 | cost of drive homozygotes — the brake on fixation |

## The three regimes the tests pin down

1. **Sweep.** At defaults the drive fixes above 0.9 within ~15 generations.
2. **Erosion.** Over 200 generations the rare resistant alleles outcompete the
   fit-costed drive — resistance is selected, and wins eventually.
3. **Takeover.** A weak drive (efficiency 0.6) under high resistance creation
   (0.25) and heavy cost (0.3) never fixes: resistance overtakes it.

That third regime is the containment story: **a poorly engineered drive fails
by creating the resistance that beats it**, and the model quantifies exactly
when. The UI's containment-horizon panel reads these three numbers off the
simulation (fixation generation, resistance-takeover generation, wild-collapse
generation) and renders a verdict.

## Where it is used

- `/gene-drive` — the live lab (parameters, presets, allele frequency chart).
- `/lab` — construct designer with the containment contract attached.
- `/scenarios` — the misalignment scenario's biosphere penalty is exactly a
  drive-escape event, applied as a slower adoption curve for everything after.
- The social card in `app/og` — every deterministic pixel.

The recursion is also the clearest example of why the repo is polyglot: it is
short enough that the Rust port can be tested to produce byte-identical
dynamics, and it is.
