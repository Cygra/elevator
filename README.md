# Elevator Scheduling Algorithm Simulator

> [中文文档](./README.zh.md)

A fully self-contained, browser-based interactive visualization of elevator scheduling algorithms.

---

## Features

1. **Bilingual UI (EN/中)** — Click the language toggle to switch all text between Chinese and English instantly.
2. **Light/Dark Mode** — Defaults to dark; toggle with the 🌙/☀️ button.
3. **Flexible Floors & Elevators** — 2–60 floors and 1–6 elevators; click Apply to rebuild instantly.
4. **Four Scheduling Algorithms** — FCFS, SCAN, LOOK, SSTF; switch at any time.
5. **Service Modes** — Normal / Zone / Odd-Even; zone and odd-even modes restrict each elevator's service range.
6. **Adjustable Zone Split** — In zone mode, drag the slider to set the boundary between low-zone and high-zone elevators.
7. **Passenger-Proportional Door Time** — More passengers boarding/alighting = longer dwell time (capped at 60 ticks).
8. **Extended Statistics** — Max Wait, Empty Rate %, Full Rate %, Energy (kWh), Total Floors Moved.
9. **A/B Algorithm Comparison** — Run two algorithms in parallel with the same passenger stream and compare metrics live.
10. **Crowd Burst Preset** — Inject 25 passengers to a random floor in one click to test peak pressure.
11. **Detailed Algorithm Descriptions** — Per-algorithm descriptions (core idea, how it works, pros/cons, best use case) in both languages.
12. **Comprehensive SEO** — Open Graph, Twitter Card, JSON-LD structured data.

---

## Quick Start

Simply open `index.html` in any modern browser — no server or dependencies needed.

```
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

---

## UI Layout

```
┌─ Header ───────────────────────────────────────────────────────────────────┐
│ ⬆️ Title | [Algorithm▼] | [Mode▼] | Floors:[n] Elevs:[n] [Apply]          │
│          | Speed:[────] | [Auto] | [A/B] | [Start][Pause][Reset] | T:0s    │
│          | [🌙] [EN/中]                                                    │
└────────────────────────────────────────────────────────────────────────────┘
┌─ Sidebar ──────────┐  ┌─ Building Visualization ──────────────────────────┐
│ 📊 Stats           │  │  Floor labels + elevator shafts with animated cars │
│ 🛗 Elevs           │  │  Call buttons (▲▼) on each floor                   │
│ ⚙️ Ctrl            │  │  Waiting passenger counts per floor                │
│ 📖 Algo            │  └────────────────────────────────────────────────────┘
│ 🆚 A/B             │  ┌─ Performance Chart ───────────────────────────────┐
│ 📋 Log             │  │  Real-time avg wait & avg travel time chart        │
└────────────────────┘  └────────────────────────────────────────────────────┘
```

---

## Scheduling Algorithms

### FCFS (First Come First Serve)
Serves requests in the order they arrive. Simplest to implement; may cause long waits under heavy load.

### SCAN (Elevator Algorithm)
Travels in one direction serving all stops, reverses at the endpoint. Fair and efficient for evenly distributed traffic.

### LOOK
Like SCAN but reverses at the last pending request, not at the physical end. More efficient than SCAN.

### SSTF (Shortest Seek Time First)
Always services the nearest request next. High throughput but may starve distant requests under imbalanced load.

---

## Technical Details

| Parameter | Value |
|-----------|-------|
| Max Floors | 60 |
| Max Elevators | 6 |
| Floor Move Ticks | 8 |
| Door Animation Ticks | 8 |
| Base Door Dwell Ticks | 20 |
| Extra Ticks Per Passenger | 3 |
| Max Door Dwell Ticks | 60 |
| Elevator Capacity | 8 passengers |
| Base Energy Per Floor | 0.002 kWh |
| Extra Energy Per Passenger Per Floor | 0.0005 kWh |

---

## Controls Reference

| Control | Function |
|---------|----------|
| Start | Start or resume the simulation |
| Pause | Pause the simulation |
| Reset | Clear and rebuild the simulation |
| Speed Slider | Adjust simulation speed (slow → fast) |
| Auto Toggle | Enable/disable automatic random passenger generation |
| A/B Toggle | Enable/disable parallel algorithm comparison |
| Floors Input | Set number of floors (2–60) |
| Elevs Input | Set number of elevators (1–6) |
| Apply Button | Apply floor/elevator count changes |
| ▲▼ Call Buttons | Manually call an elevator on a specific floor |
| Zone Split Slider | Adjust the boundary floor between low-zone and high-zone (zone mode only) |
| 🌙/☀️ | Toggle dark/light theme |
| EN/中 | Toggle language |

---

## File Structure

```
├── index.html   — HTML structure, SEO meta tags, Google Fonts
├── styles.css   — All CSS with dark/light theme variables
├── app.js       — Simulation engine, UI logic, i18n
├── README.md    — English documentation (this file)
└── README.zh.md — Chinese documentation
```

---

## License

MIT © 2024 Elevator Simulator Contributors
