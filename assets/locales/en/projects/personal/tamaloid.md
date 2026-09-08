---
title: Tamaloid
description: A **Hatsune Miku-themed handheld virtual pet** built with RP2040 firmware and a Rust 3D emulator
logo_image: ../../images/projects/tamaloid.webp
mockup_images:
  - ./tamaloid/tamaloid.png
  - ./tamaloid/tamaloid-prototype.png
period: 2026.09 ~
source_code: Private source · Firmware, emulator, and hardware prototype are in development and can be shared on request
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

## Overview

Tamaloid combines a **Hatsune Miku-themed RP2040 Zero handheld virtual pet** with a cross-platform 3D emulator that reproduces the device. I designed the hardware around an ST7735 LCD, DS3231 RTC, ADXL345 accelerometer, three buttons, and PWM audio, then implemented the system so the same C++17 firmware runs on both the physical target and host emulator.

The Rust wgpu/winit emulator displays the live 128×160 LCD framebuffer on a 3D model of the enclosure. Its keyboard, pointer, and touch controls can press the modeled buttons directly and tilt the case to generate accelerometer input. A separate build123d project models an **83×97×33.1 mm parametric enclosure** with the internal electronics, buttons, battery cover, and assembly clearances.

## My Role

- Designed the RP2040 Zero peripheral layout, pin map, power, audio and backlight control, and prototype bill of materials.
- Built a **narrow SPI/I²C/GPIO/PWM hardware abstraction** so Pico SDK and virtual devices exercise the same drivers.
- Connected the C++17 firmware through a C ABI and implemented the native lifecycle, 3D rendering, camera, and keyboard, pointer, and touch input in Rust.
- Modeled the enclosure and assembly parts parametrically in build123d, with automated checks for dimensions, intersections, buttons, screws, and battery-cover motion.

## Problems and Solutions

- Problem: Firmware results cannot be trusted when the physical device and emulator use different application logic.
- Solution: Modeled the ST7735, DS3231, ADXL345, GPIO buttons, PWM audio, and storage at the register and bus level, keeping **the same application, drivers, and SPI/I²C/GPIO/PWM call paths** in both environments.

- Problem: A flat UI cannot accurately test the physical relationship between a handheld device's screen, buttons, enclosure, and tilt input.
- Solution: Applied the live LCD texture and depth rendering to the repository-embedded OBJ enclosure, used ray casting for 3D button presses, and converted enclosure rotation into ADXL345 samples delivered to the firmware.

## Quantified Results

- Created **four platform entry paths** for macOS, Windows, Android, and iOS from one Rust crate.
- Implemented virtual hardware for the 128×160 LCD, RTC, accelerometer, buttons, audio, and storage, verified through C++ unit tests, a C ABI smoke test, Rust tests, and a headless GUI smoke test.
- Completed an **83×97×33.1 mm** parametric enclosure layout for the LCD, RP2040 Zero, RTC, accelerometer, amplifier, speaker, and AAA battery holder.
