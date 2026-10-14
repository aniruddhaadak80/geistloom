//! The loom engine — deterministic world dynamics in Rust.
//!
//! Two engines live here:
//!
//! 1. `integrate` — an RK4 integrator for the Century Engine's
//!    coupled ODE system (life expectancy, knowledge stock, AI
//!    capability, population, biosphere health).
//! 2. `gene_drive` — the three-allele (wild/drive/resistant)
//!    gene-drive recursion, generation by generation.
//!
//! Both are pure functions with no allocator surprises, no
//! threads, no time — the same input always yields the same
//! output, which is the entire point of the frame.

use serde::{Deserialize, Serialize};

/// World state vector for the RK4 integrator.
/// Order: [life_expectancy, knowledge, ai, population, biosphere]
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct StateVector {
    pub life_expectancy: f64,
    pub knowledge: f64,
    pub ai: f64,
    pub population: f64,
    pub biosphere: f64,
}

impl StateVector {
    pub fn new(
        life_expectancy: f64,
        knowledge: f64,
        ai: f64,
        population: f64,
        biosphere: f64,
    ) -> Self {
        Self {
            life_expectancy,
            knowledge,
            ai,
            population,
            biosphere,
        }
    }

    /// Baseline 2026 world.
    pub fn baseline_2026() -> Self {
        Self::new(73.8, 0.08, 22.0, 8.09, 66.0)
    }
}

/// Parameters of the coupled system.
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct EngineParams {
    /// Research compounding rate.
    pub research_rate: f64,
    /// AI capability growth rate.
    pub ai_rate: f64,
    /// Knowledge → biosphere restoration coefficient.
    pub bio_restoration: f64,
    /// Baseline biosphere pressure.
    pub bio_pressure: f64,
}

impl Default for EngineParams {
    fn default() -> Self {
        Self {
            research_rate: 0.011,
            ai_rate: 0.028,
            bio_restoration: 0.32,
            bio_pressure: 0.24,
        }
    }
}

fn clamp(v: f64, lo: f64, hi: f64) -> f64 {
    if v < lo {
        lo
    } else if v > hi {
        hi
    } else {
        v
    }
}

/// The coupled ODE system: dy/dt = f(y, p).
pub fn derivatives(y: &StateVector, p: &EngineParams) -> StateVector {
    let d_le = (81.7 - y.life_expectancy) * 0.045;
    let d_knowledge = p.research_rate * (0.25 + y.ai / 100.0) * (1.0 - y.knowledge);
    let d_ai = (100.0 - y.ai) * p.ai_rate;
    let birth_rate = clamp(0.024 - 0.0006 * (y.life_expectancy - 65.0), 0.003, 0.03);
    let death_rate = 1.0 / (y.life_expectancy * 1.08);
    let d_population = y.population * (birth_rate - death_rate);
    let d_biosphere =
        p.bio_restoration * y.knowledge - p.bio_pressure - (birth_rate - death_rate).max(0.0) * 0.9;
    StateVector::new(d_le, d_knowledge, d_ai, d_population, d_biosphere)
}

/// Classic explicit RK4 step with fixed dt.
pub fn rk4_step(y: &StateVector, p: &EngineParams, dt: f64) -> StateVector {
    let k1 = derivatives(y, p);
    let y2 = add_scaled(y, &k1, dt * 0.5);
    let k2 = derivatives(&y2, p);
    let y3 = add_scaled(y, &k2, dt * 0.5);
    let k3 = derivatives(&y3, p);
    let y4 = add_scaled(y, &k3, dt);
    let k4 = derivatives(&y4, p);

    let combine = |a: f64, b: f64, c: f64, d: f64, e: f64| a + (b + c + c + d + d + e) * dt / 6.0;
    StateVector::new(
        combine(
            y.life_expectancy,
            k1.life_expectancy,
            k2.life_expectancy,
            k3.life_expectancy,
            k4.life_expectancy,
        ),
        combine(
            y.knowledge,
            k1.knowledge,
            k2.knowledge,
            k3.knowledge,
            k4.knowledge,
        ),
        combine(y.ai, k1.ai, k2.ai, k3.ai, k4.ai),
        clamp(
            combine(
                y.population,
                k1.population,
                k2.population,
                k3.population,
                k4.population,
            ),
            0.1,
            40.0,
        ),
        clamp(
            combine(
                y.biosphere,
                k1.biosphere,
                k2.biosphere,
                k3.biosphere,
                k4.biosphere,
            ),
            2.0,
            100.0,
        ),
    )
}

fn add_scaled(y: &StateVector, k: &StateVector, s: f64) -> StateVector {
    StateVector::new(
        y.life_expectancy + k.life_expectancy * s,
        y.knowledge + k.knowledge * s,
        y.ai + k.ai * s,
        y.population + k.population * s,
        y.biosphere + k.biosphere * s,
    )
}

/// Integrate the system for `steps` RK4 steps of size `dt`.
pub fn integrate(y0: &StateVector, p: &EngineParams, dt: f64, steps: usize) -> Vec<StateVector> {
    let mut out = Vec::with_capacity(steps + 1);
    let mut y = *y0;
    out.push(y);
    for _ in 0..steps {
        y = rk4_step(&y, p, dt);
        out.push(y);
    }
    out
}

/// UN WPP-anchored baseline target life expectancy.
pub fn baseline_life_expectancy(year: f64) -> f64 {
    let first = clamp((year - 2026.0) / 74.0, 0.0, 1.0);
    let second = clamp((year - 2100.0) / 100.0, 0.0, 1.0);
    73.8 + 7.9 * first + 4.0 * second
}

/// Longevity escape velocity: first year where the annual
/// life-expectancy gain exceeds 1.0 year. None if never.
pub fn years_to_escape_velocity(
    trajectory: &[StateVector],
    start_year: f64,
    dt: f64,
) -> Option<f64> {
    for i in 1..trajectory.len() {
        let gain = (trajectory[i].life_expectancy - trajectory[i - 1].life_expectancy) / dt;
        if gain > 1.0 {
            return Some(start_year + i as f64 * dt);
        }
    }
    None
}

// ---------------------------------------------------------------------------
// Gene drive module
// ---------------------------------------------------------------------------

/// Three-allele population state: wild / drive / resistant.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct AlleleFrequencies {
    pub wild: f64,
    pub drive: f64,
    pub resistant: f64,
}

impl AlleleFrequencies {
    pub fn new(wild: f64, drive: f64, resistant: f64) -> Self {
        Self {
            wild,
            drive,
            resistant,
        }
    }

    pub fn sum(&self) -> f64 {
        self.wild + self.drive + self.resistant
    }
}

/// Gene-drive parameters.
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct GeneDriveParams {
    /// Homing efficiency: probability a wild allele is converted.
    pub drive_efficiency: f64,
    /// Probability a cleavage yields a resistant allele.
    pub resistance_rate: f64,
    /// Fitness cost of drive homozygotes.
    pub fitness_cost: f64,
}

impl Default for GeneDriveParams {
    fn default() -> Self {
        Self {
            drive_efficiency: 0.95,
            resistance_rate: 0.02,
            fitness_cost: 0.05,
        }
    }
}

/// One generation of the homing-drive recursion.
/// Conversions are capped at the available wild frequency so population
/// mass is conserved (you cannot convert more wild alleles than exist).
pub fn gene_drive_step(state: &AlleleFrequencies, p: &GeneDriveParams) -> AlleleFrequencies {
    let heterozygote = 2.0 * state.wild * state.drive;
    let conversions = (p.drive_efficiency * heterozygote).min(state.wild);
    let new_resistances = p.resistance_rate * conversions;

    let w_next = (state.wild - conversions).max(0.0);
    let d_next = (state.drive + conversions - new_resistances).max(0.0);
    let r_next = state.resistant + new_resistances;

    // Selection against drive homozygotes.
    let mean_fitness = w_next * w_next
        + 2.0 * w_next * d_next
        + 2.0 * w_next * r_next
        + 2.0 * d_next * r_next
        + r_next * r_next
        + d_next * d_next * (1.0 - p.fitness_cost);
    let safe = if mean_fitness > 0.0 {
        mean_fitness
    } else {
        1.0
    };

    let w_sel = w_next / safe;
    let d_sel = d_next * (1.0 - p.fitness_cost * d_next) / safe;
    let r_sel = r_next / safe;
    let total = w_sel + d_sel + r_sel;
    let safe_total = if total > 0.0 { total } else { 1.0 };

    AlleleFrequencies::new(w_sel / safe_total, d_sel / safe_total, r_sel / safe_total)
}

/// Simulate `generations` of the drive from an initial frequency.
pub fn simulate_gene_drive(
    initial_frequency: f64,
    p: &GeneDriveParams,
    generations: usize,
) -> Vec<AlleleFrequencies> {
    let mut out = Vec::with_capacity(generations + 1);
    let mut state = AlleleFrequencies::new(
        clamp(1.0 - initial_frequency, 0.0, 1.0),
        clamp(initial_frequency, 0.0, 1.0),
        0.0,
    );
    out.push(state);
    for _ in 0..generations {
        state = gene_drive_step(&state, p);
        out.push(state);
    }
    out
}

/// Generations until drive frequency crosses `threshold`. None if never.
pub fn time_to_frequency(
    initial_frequency: f64,
    p: &GeneDriveParams,
    generations: usize,
    threshold: f64,
) -> Option<usize> {
    for (g, s) in simulate_gene_drive(initial_frequency, p, generations)
        .iter()
        .enumerate()
    {
        if s.drive >= threshold {
            return Some(g);
        }
    }
    None
}
