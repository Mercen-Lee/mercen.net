---
title: Tamaloid
description: RP2040 펌웨어와 Rust 3D 에뮬레이터로 구현하는 **하츠네 미쿠 테마 휴대용 다마고치**
logo_image: ../../images/projects/tamaloid.webp
mockup_images:
  - ./tamaloid/tamaloid.png
  - ./tamaloid/tamaloid-prototype.png
period: 2026.09 ~
source_code: 소스 비공개 · 펌웨어·에뮬레이터·하드웨어 시제품 개발 중, 요청 시 공유 가능
vibe_coded: true
tech_stacks:
  - Rust
  - C++
  - wgpu
  - winit
  - WebGPU
  - Python
  - build123d
---

# Tamaloid

## 개요

Tamaloid는 **RP2040 Zero 기반의 하츠네 미쿠 테마 휴대용 다마고치**와 그 동작을 재현하는 크로스플랫폼 3D 에뮬레이터를 함께 만드는 프로젝트입니다. ST7735 LCD, DS3231 RTC, ADXL345 가속도계, 3개 버튼, PWM 오디오를 사용하는 실제 기기 구조를 설계하고, 동일한 C++17 펌웨어가 하드웨어와 호스트 에뮬레이터에서 모두 실행되도록 구현했습니다.

Rust와 wgpu/winit으로 만든 에뮬레이터는 실제 케이스의 3D 모델에 128×160 LCD 프레임버퍼를 표시합니다. 키보드뿐 아니라 포인터와 터치로 3D 버튼을 직접 누르고, 케이스를 기울여 가속도계 입력까지 재현할 수 있습니다. 별도의 build123d 프로젝트에서는 내부 전자부품, 버튼, 배터리 커버와 조립 여유 공간을 포함한 **83×97×33.1mm 파라메트릭 케이스**를 설계했습니다.

## 내 역할

- RP2040 Zero와 주변 장치의 회로 구성, 핀맵, 전원·오디오·백라이트 제어, 시제품 BOM을 설계했습니다.
- Pico SDK와 가상 장치가 같은 드라이버를 공유하도록 SPI/I²C/GPIO/PWM 기반의 **좁은 하드웨어 추상화 계층**을 구현했습니다.
- C++17 펌웨어를 C ABI로 연결하고, Rust에서 네이티브 생명주기, 3D 렌더링, 카메라와 키보드·포인터·터치 입력을 구현했습니다.
- build123d로 케이스와 조립 부품을 파라메트릭 모델링하고, 치수·간섭·버튼·나사·배터리 커버 동작을 자동 검증했습니다.

## 문제와 해결

- 문제: 실제 기기와 에뮬레이터가 서로 다른 로직을 사용하면 펌웨어 검증 결과를 신뢰하기 어렵습니다.
- 해결: ST7735, DS3231, ADXL345, GPIO 버튼과 PWM 오디오를 레지스터·버스 수준에서 모델링하고, 양쪽 환경이 **동일한 앱·드라이버·SPI/I²C/GPIO/PWM 호출 경로**를 사용하게 했습니다.

- 문제: 평면 UI만으로는 휴대용 기기의 버튼, 기울기, 화면과 케이스의 물리적 관계를 검증하기 어렵습니다.
- 해결: 저장소에 포함된 OBJ 케이스에 실시간 LCD 텍스처와 depth rendering을 적용하고, ray casting으로 3D 버튼 입력을 처리했습니다. 케이스 회전값은 ADXL345 샘플로 변환해 펌웨어까지 전달했습니다.

## 수치화된 성과

- macOS·Windows·Android·iOS를 대상으로 하는 **4개 플랫폼 진입 경로**를 하나의 Rust crate로 구성했습니다.
- 128×160 LCD와 RTC·가속도계·버튼·오디오·저장장치의 가상 하드웨어를 구현하고 C++ 단위 테스트, C ABI smoke test, Rust 테스트, headless GUI smoke test로 검증했습니다.
- **83×97×33.1mm** 케이스 안에 LCD, RP2040 Zero, RTC, 가속도계, 앰프, 스피커와 AAA 배터리 홀더를 배치하는 파라메트릭 모델을 완성했습니다.
