name: Feature request
about: Propose a new organ for the frame
title: "[feature] "
labels: ["enhancement", "triage"]
body:
  - type: textarea
    id: problem
    attributes:
      label: What problem does this solve?
      description: Why does the frame need this?
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposed solution
      description: Routes, packages, engines — as concrete as you can
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives considered
  - type: checkboxes
    id: checks
    attributes:
      label: Checklist
      options:
        - label: I checked the roadmap docs first (docs/roadmap.md)
          required: true
        - label: This fits the deterministic, zero-API-key philosophy
          required: true
