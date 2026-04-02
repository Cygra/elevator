# 电梯调度算法模拟器 | Elevator Scheduling Algorithm Simulator

> 完全自包含的浏览器端交互式电梯调度算法可视化工具  
> A fully self-contained, browser-based interactive visualization of elevator scheduling algorithms.

---

## 功能特性 | Features

1. **双语界面 (EN/中)** — 点击右上角语言切换按钮，所有文字即时切换中/英文。  
   **Bilingual UI** — Click the language toggle to switch all text between Chinese and English instantly.

2. **明/暗主题** — 默认暗色，点击 🌙/☀️ 按钮切换。  
   **Light/Dark Mode** — Defaults to dark; toggle with the 🌙/☀️ button.

3. **灵活的楼层与电梯数量** — 支持 2–60 层、1–6 台电梯，点击 Apply 即时重建。  
   **Flexible Floors & Elevators** — 2–60 floors and 1–6 elevators; click Apply to rebuild instantly.

4. **四种调度算法** — FCFS、SCAN、LOOK、SSTF，可实时切换。  
   **Four Scheduling Algorithms** — FCFS, SCAN, LOOK, SSTF; switch at any time.

5. **服务模式** — 普通 / 分区 / 奇偶层，分区和奇偶层模式会限制电梯服务范围。  
   **Service Modes** — Normal / Zone / Odd-Even; zone and odd-even modes restrict each elevator's service range.

6. **乘客比例开门时长** — 乘客越多，开门停靠时间越长（最长 60 Ticks）。  
   **Passenger-Proportional Door Time** — More passengers = longer dwell time (capped at 60 ticks).

7. **扩展统计** — 最大等待、空载率%、满载率%、电耗(kWh)。  
   **Extended Statistics** — Max Wait, Empty Rate%, Full Rate%, Energy(kWh).

8. **A/B 算法对比** — 勾选后并行运行两个算法，实时比较性能指标。  
   **A/B Algorithm Comparison** — Check the toggle to run two algorithms in parallel and compare metrics live.

9. **人群涌入预设** — 一键向随机楼层注入 25 名乘客，测试峰值压力。  
   **Crowd Burst Preset** — Inject 25 passengers to a random floor in one click.

10. **详细算法描述标签页** — 每种算法的核心思想、原理、优缺点、适用场景（中英双语）。  
    **Algorithm Detail Tab** — Per-algorithm descriptions (core idea, how it works, pros/cons, best use case) in both languages.

11. **全面 SEO** — Open Graph、Twitter Card、JSON-LD 结构化数据。  
    **Comprehensive SEO** — Open Graph, Twitter Card, JSON-LD structured data in the `<head>`.

---

## 快速使用 | Quick Start

直接用浏览器打开 `index.html` 即可，无需服务器或依赖安装。  
Simply open `index.html` in any modern browser — no server or dependencies needed.

```
open index.html        # macOS
xdg-open index.html   # Linux
start index.html       # Windows
```

---

## 界面布局 | UI Layout

```
┌─ Header ───────────────────────────────────────────────────────────────────┐
│ ⬆️ Title | [Algorithm▼] | [Mode▼] | Floors:[n] Elevs:[n] [Apply]          │
│          | Speed:[────] | [Auto] | [A/B] | [Start][Pause][Reset] | T:0s    │
│          | [🌙] [EN/中]                                                    │
└────────────────────────────────────────────────────────────────────────────┘
┌─ Sidebar ──────────┐  ┌─ Building Visualization ──────────────────────────┐
│ 📊 Stats           │  │  Floor labels + elevator shafts with animated cars │
│ 🛗 Elevs           │  │  Call buttons (▲▼) on each floor                   │
│ ⚙️ Ctrl            │  └────────────────────────────────────────────────────┘
│ 📖 Algo            │
│ 🆚 A/B             │
│ 📋 Log             │
└────────────────────┘
```

---

## 调度算法说明 | Algorithm Descriptions

### FCFS (先来先服务 / First Come First Serve)
- 按请求到达顺序依次服务。实现最简单，但对后来乘客可能造成长等待。  
- Serves requests in the order they arrive. Simplest to implement; may cause long waits.

### SCAN (扫描算法 / Elevator Algorithm)
- 向一个方向运行，服务沿途所有请求，到达端点后反向。  
- Travels in one direction serving all stops, reverses at the endpoint. Fair and efficient.

### LOOK
- 类似 SCAN，但只在最后一个请求处反向，而非端点。  
- Like SCAN but reverses at the last pending request, not at the physical end. More efficient than SCAN.

### SSTF (最短寻道时间优先 / Shortest Seek Time First)
- 每次服务距当前位置最近的请求。高吞吐量，但可能造成"饥饿"。  
- Always serves the nearest request next. High throughput but may starve distant requests.

---

## 技术细节 | Technical Details

| 项目 | 值 |
|------|-----|
| 最大楼层数 | 60 |
| 最大电梯数 | 6 |
| 每楼层移动 Ticks | 8 |
| 开关门动画 Ticks | 8 |
| 开门停靠基础 Ticks | 20 |
| 每位乘客额外 Ticks | 3 |
| 最长停靠 Ticks | 60 |
| 电梯容量 | 8 人 |
| 基础电耗/楼层 | 0.002 kWh |
| 每人额外电耗/楼层 | 0.0005 kWh |

---

## 控制参考 | Controls Reference

| 控件 | 功能 |
|------|------|
| Start / 开始 | 启动/继续模拟 |
| Pause / 暂停 | 暂停模拟 |
| Reset / 重置 | 清空并重建模拟 |
| Speed Slider | 调整模拟速度 (慢→快) |
| Auto Toggle | 开启/关闭自动随机乘客生成 |
| A/B Toggle | 开启/关闭并行算法对比 |
| Floors Input | 设置楼层数 (2–60) |
| Elevs Input | 设置电梯数 (1–6) |
| Apply Button | 应用楼层/电梯数量变更 |
| ▲▼ Call Buttons | 在指定楼层手动呼叫电梯 |
| 🌙/☀️ | 切换暗/亮主题 |
| EN/中 | 切换语言 |

---

## 许可 | License

MIT © 2024 Elevator Simulator Contributors
