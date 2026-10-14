//! Integration tests for the loom engine.
//!
//! These exercise the public API exactly as external crates
//! would: the RK4 integrator, the UN baseline anchors, and
//! the three-allele gene-drive recursion.

use geistloom_loom_engine::{
    baseline_life_expectancy, integrate, simulate_gene_drive, time_to_frequency, AlleleFrequencies,
    EngineParams, GeneDriveParams, StateVector,
};

#[test]
fn rk4_converges_life_expectancy_toward_un_baseline() {
    let params = EngineParams::default();
    let trajectory = integrate(&StateVector::baseline_2026(), &params, 1.0, 74);
    let final_le = trajectory.last().unwrap().life_expectancy;
    let target = baseline_life_expectancy(2100.0);
    assert!(
        (final_le - target).abs() < 2.0,
        "final LE {final_le} should approach UN baseline {target}"
    );
}

#[test]
fn rk4_is_deterministic() {
    let params = EngineParams::default();
    let a = integrate(&StateVector::baseline_2026(), &params, 0.25, 40);
    let b = integrate(&StateVector::baseline_2026(), &params, 0.25, 40);
    assert_eq!(a, b);
}

#[test]
fn knowledge_stock_increases_and_saturates() {
    let params = EngineParams::default();
    let trajectory = integrate(&StateVector::baseline_2026(), &params, 1.0, 100);
    let first = trajectory.first().unwrap().knowledge;
    let last = trajectory.last().unwrap().knowledge;
    assert!(last > first);
    assert!(last <= 1.0);
}

#[test]
fn ai_capability_climbs_but_capped_at_100() {
    let params = EngineParams::default();
    let trajectory = integrate(&StateVector::baseline_2026(), &params, 1.0, 100);
    for s in &trajectory {
        assert!(s.ai >= 0.0 && s.ai <= 100.0);
    }
}

#[test]
fn population_stays_in_sane_bounds() {
    let params = EngineParams::default();
    let trajectory = integrate(&StateVector::baseline_2026(), &params, 1.0, 200);
    for s in &trajectory {
        assert!(
            s.population > 1.0 && s.population < 40.0,
            "population {}",
            s.population
        );
    }
}

#[test]
fn biosphere_stays_within_bounds() {
    let params = EngineParams::default();
    let trajectory = integrate(&StateVector::baseline_2026(), &params, 1.0, 200);
    for s in &trajectory {
        assert!(s.biosphere >= 2.0 && s.biosphere <= 100.0);
    }
}

#[test]
fn baseline_life_expectancy_matches_un_anchors() {
    assert!((baseline_life_expectancy(2026.0) - 73.8).abs() < 0.01);
    assert!((baseline_life_expectancy(2100.0) - 81.7).abs() < 0.01);
}

#[test]
fn gene_drive_sweeps_with_default_params() {
    let p = GeneDriveParams::default();
    let trajectory = simulate_gene_drive(0.01, &p, 60);
    // The drive fixes fast: peak within the first 15 generations.
    let peak = trajectory
        .iter()
        .fold(0.0, |m, s| if s.drive > m { s.drive } else { m });
    assert!(peak > 0.9, "peak drive frequency {}", peak);
    let peak_gen = trajectory
        .iter()
        .position(|s| s.drive == peak)
        .unwrap_or(usize::MAX);
    assert!(peak_gen <= 15, "peak at generation {}", peak_gen);
    // Wild-type is driven to near zero within 10 generations.
    assert!(trajectory[10].wild < 0.1);
}

#[test]
fn resistance_erodes_a_fixed_drive_over_long_horizons() {
    let p = GeneDriveParams::default();
    let trajectory = simulate_gene_drive(0.01, &p, 200);
    let last = trajectory.last().unwrap();
    // Fitness costs let rare resistant alleles outcompete the fixed drive.
    assert!(last.resistant > 0.2, "resistant {}", last.resistant);
}

#[test]
fn gene_drive_frequencies_sum_to_one() {
    let p = GeneDriveParams::default();
    for state in simulate_gene_drive(0.05, &p, 50) {
        assert!(
            (state.sum() - 1.0).abs() < 1e-6,
            "sum {}",
            state.sum()
        );
    }
}

#[test]
fn resistance_overtakes_weak_drives() {
    let p = GeneDriveParams {
        drive_efficiency: 0.6,
        resistance_rate: 0.25,
        fitness_cost: 0.3,
    };
    let trajectory = simulate_gene_drive(0.01, &p, 400);
    let takeover = trajectory
        .iter()
        .position(|s| s.resistant > s.drive && s.resistant > 0.01);
    assert!(takeover.is_some(), "resistance never overtook the drive");
}

#[test]
fn perfect_drive_reaches_threshold_fast() {
    let p = GeneDriveParams {
        drive_efficiency: 0.99,
        resistance_rate: 0.001,
        fitness_cost: 0.01,
    };
    let t = time_to_frequency(0.01, &p, 100, 0.9);
    assert!(t.is_some() && t.unwrap() <= 20, "t = {:?}", t);
}

#[test]
fn allele_frequencies_round_trip_through_json() {
    let state = AlleleFrequencies::new(0.25, 0.5, 0.25);
    let json = serde_json::to_string(&state).unwrap();
    let back: AlleleFrequencies = serde_json::from_str(&json).unwrap();
    assert_eq!(state, back);
}
