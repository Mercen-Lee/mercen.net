---
title: AMAZE Paint
description: Rust와 wgpu로 구축하는 **작가 중심의 차세대 페인팅 IDE**
logo_image: ../../images/projects/amaze.webp
period: 2026.07 ~
source_code: 소스 비공개 · 개발 중인 프로젝트로, 요청 시 공유 가능
vibe_coded: true
tech_stacks:
  - Rust
  - wgpu
  - SQLite
  - WebAssembly
  - MCP
---

# AMAZE Paint

## 개요

AMAZE Paint는 Rust와 wgpu로 개발 중인 **작가 중심의 종합 페인팅 IDE**입니다. CLIP STUDIO PAINT급의 일러스트·만화·애니메이션·3D reference·소재와 브러시 제작 workflow를 목표로 하며, 타사 앱을 복제하지 않고 독자적인 Document DOM, 렌더러, UI 플랫폼과 `.amzp` 파일 포맷을 구축하고 있습니다.

AI가 그림을 대신 만드는 앱보다, 작가가 만든 문서 전체를 안전하게 이해하고 반복 작업을 자동화하는 도구를 지향합니다. GUI, CLI, MCP, Plugin과 AI의 모든 변경을 하나의 Command/Transaction 경로로 통과시켜 Undo/Redo, 권한 검토, audit와 provenance를 일관되게 처리하도록 설계했습니다.

## 내 역할

- 제품 원칙과 전체 아키텍처를 설계하고, 공용 AMAZE UI/runtime crate와 Paint 도메인 crate의 경계를 정의했습니다.
- raster·vector·text·comic·animation·3D 작업을 표현하는 Document DOM과 Command/Transaction/Undo 구조를 설계했습니다.
- SQLite 기반 단일 파일 컨테이너인 `.amzp`를 canonical native format으로 두고 PSD/PSB, KRA와 CLIP을 호환 계층으로 분리했습니다.
- Rust·WebAssembly·native plugin, CLI/MCP와 AI 자동화가 동일한 권한·명령 경로를 사용하도록 확장 구조를 설계했습니다.

## 문제와 해결

- 문제: GUI, 플러그인과 AI가 문서를 각자 수정하면 Undo/Redo와 권한, 감사 기록이 쉽게 분리됩니다.
- 해결: 모든 편집을 검증 가능한 Command와 Transaction으로 표현하고, preview·apply·undo·audit·provenance가 **하나의 mutation pipeline**을 통과하도록 했습니다.

- 문제: 복잡한 페인팅 문서와 여러 외부 포맷을 동시에 지원하면 내부 모델이 호환성 제약에 끌려가기 쉽습니다.
- 해결: `.amzp`와 독자 Document DOM을 제품의 기준으로 고정하고, PSD/PSB·KRA·CLIP은 격리된 import/export compatibility 계층으로 설계했습니다.

## 수치화된 성과

- 프로젝트 기반부터 제품 하드닝까지 **M00~M19의 20개 마일스톤**으로 구현·검증 순서를 구조화했습니다.
- 일러스트·만화·애니메이션·3D reference·소재/브러시 제작 등 **5개 이상의 작가 workflow**를 하나의 문서 모델로 연결했습니다.
- GUI·CLI·MCP·Plugin·AI의 **5개 진입 경로**가 동일한 권한과 Command/Transaction 구조를 사용하도록 설계했습니다.
