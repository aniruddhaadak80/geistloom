/**
 * Seed writer — run with `bun packages/seed/seed.ts`.
 * Regenerates the offline datasets in packages/seed/src/data/
 * from the committed SEED. Deterministic: same seed → same bytes.
 */
import { SEED, writeSeedDatasets } from "./src/index";

writeSeedDatasets();
console.log(`[geistloom-seed] wrote datasets from seed ${SEED} into src/data/`);
