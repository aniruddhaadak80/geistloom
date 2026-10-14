name: Bug report
about: Report a broken frame
title: "[bug] "
labels: ["bug", "triage"]
body:
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: What did you expect, and what did the frame do instead?
      placeholder: The Oracle answered... but the Century Engine...
    validations:
      required: true
  - type: textarea
    id: reproduce
    attributes:
      label: How to reproduce
      description: Exact steps, inputs, seed values.
      placeholder: |
        1. bun run dev
        2. /oracle → prompt "solve aging"
        3. observed: ...
    validations:
      required: true
  - type: input
    id: version
    attributes:
      label: Version / commit
      description: bun run geistloom --version or git SHA
  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: OS, bun version, node version
      placeholder: Windows 11 / bun 1.3.14 / node 22
  - type: checkboxes
    id: checks
    attributes:
      label: Checklist
      options:
        - label: I searched existing issues first
          required: true
        - label: This is not a security vulnerability
          required: true
