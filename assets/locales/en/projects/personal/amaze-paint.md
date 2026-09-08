---
title: AMAZE Paint
description: An **artist-centered next-generation painting IDE** built with Rust and wgpu
logo_image: ../../images/projects/amaze.webp
period: 2026.07 ~
source_code: Private source · The project is under development and can be shared on request
vibe_coded: true
tech_stacks:
  - Rust
  - wgpu
  - SQLite
  - WebAssembly
  - MCP
---

# AMAZE Paint

## Overview

AMAZE Paint is an **artist-centered comprehensive painting IDE** under development in Rust and wgpu. It targets illustration, comics, animation, 3D reference, materials, and brush-authoring workflows at the scope of CLIP STUDIO PAINT while building its own Document DOM, renderer, UI platform, and `.amzp` file format instead of replicating another application.

Rather than replacing the artist, it is designed to safely understand an artist's complete document and automate repetitive work. Every change from the GUI, CLI, MCP, plugins, or AI passes through the same Command and Transaction path so undo/redo, permission review, audit, and provenance remain consistent.

## My Role

- Defined the product principles and system architecture, including the boundaries between the shared AMAZE UI/runtime crates and the Paint domain crates.
- Designed the Document DOM and Command/Transaction/Undo model for raster, vector, text, comics, animation, and 3D workflows.
- Established the SQLite-backed single-file `.amzp` container as the canonical native format, with PSD/PSB, KRA, and CLIP isolated behind compatibility layers.
- Designed an extension model in which Rust, WebAssembly and native plugins, CLI/MCP, and AI automation share the same permission and command paths.

## Problems and Solutions

- Problem: When the GUI, plugins, and AI mutate a document independently, undo/redo, permissions, and audit history quickly diverge.
- Solution: Represented every edit as a validated Command and Transaction so preview, apply, undo, audit, and provenance pass through **one mutation pipeline**.

- Problem: Supporting complex painting documents and several external formats at once can force the internal model to inherit compatibility constraints.
- Solution: Made `.amzp` and the independent Document DOM the product's source of truth, keeping PSD/PSB, KRA, and CLIP in isolated import/export compatibility layers.

## Quantified Results

- Structured implementation and validation from project foundation through product hardening into **20 milestones from M00 to M19**.
- Connected **more than five artist workflows**—illustration, comics, animation, 3D reference, and material and brush authoring—through one document model.
- Designed **five entry paths**—GUI, CLI, MCP, plugins, and AI—to share one permission and Command/Transaction architecture.
