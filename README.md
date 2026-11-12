# GridSense AI: Interactive Microgrid Energy Management System & Virtual Engineering Laboratory

> A browser-based virtual laboratory that simulates solar integration, battery storage protection and autonomous load shedding for a smart-city microgrid, built for the **2026 IEEE Metaverse Grand Challenge for Simulation-Based Learning** under the theme **Sustainable Smart Cities and Urban Innovation**.

![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-yellow)
![Three.js](https://img.shields.io/badge/Three.js-r128-black)
![WebGL](https://img.shields.io/badge/3D-WebGL-blue)
![Web Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API-orange)
![TailwindCSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38bdf8)
![IEEE](https://img.shields.io/badge/IEEE-Metaverse%20Grand%20Challenge%202026-red)
![Status](https://img.shields.io/badge/Status-Submitted-brightgreen)

---

## Project

### GridSense AI

**Author:** Thato Maelane, Student, Tshwane University of Technology, South Africa

**Competition:** 2026 IEEE Metaverse Grand Challenge for Simulation-Based Learning

**Theme:** Sustainable Smart Cities and Urban Innovation

GridSense AI is an interactive virtual laboratory that lets electrical engineering and urban planning students experiment with a small city microgrid. Learners change solar generation and city loads in real time and watch the power flows, battery state of charge and automated protection rules respond, with no physical microgrid hardware required.

---

## Competition

The IEEE Metaverse Grand Challenge for Simulation-Based Learning invites students and young professionals to build immersive, interactive simulations that improve learning and training. Entrants choose one of three themes:

1. Healthcare Applications in Digital Learning
2. **Sustainable Smart Cities and Urban Innovation** *(selected for this project)*
3. Advanced Learning in Educational or Classroom Environments

The Sustainable Smart Cities theme covers sustainability principles through virtual laboratories, energy-efficient systems and sustainability analytics, and public safety infrastructure and disaster resilience. GridSense AI addresses all three: it is a virtual lab, it demonstrates energy-efficient renewable integration, and it teaches resilience by protecting critical infrastructure during energy shortages.

**Submission format:** a PowerPoint presentation (maximum 5 slides) and a 5 to 7 minute demonstration video.

**Contest period:** 15 February 2026 to 15 August 2026

**Judging criteria:**

| Criterion | Weight |
|---|---:|
| Effectiveness of Simulation-Based Learning | 25% |
| Creativity & Innovation | 20% |
| Educational Impact and/or Learning Effectiveness | 20% |
| User Experience (UI/UX) & Engagement | 15% |
| Integration of AI, Gamification, and/or Adaptive Learning | 10% |
| Sustainability, Accessibility, and/or Ethical Considerations | 10% |

---

## Problem Statement

Electrical engineering and urban planning students often struggle to visualize invisible power flows, battery dynamics and system-level state transitions. Physical microgrid infrastructure is expensive and is rarely available to low-resource institutions, and failure scenarios such as a blackout or battery deep discharge cannot be safely demonstrated on real equipment.

GridSense AI provides a **zero-risk, zero-install** environment where students can push a microgrid to its limits, see exactly why the system reacts the way it does, and learn the engineering and ethical reasoning behind each protection rule.

---

## Presentation and Demo

- **Project presentation and demonstration (Google Drive):** [Watch / view here](https://drive.google.com/file/d/16UaZ9Adk8EcUF0nIsl2WMD7dOXOEdqjc/view?usp=drive_link)
- **Competition presentation (PDF):** `GridSense_AI_Presentation.pdf`
- **Competition presentation (PowerPoint):** `GridSense_AI_Presentation.pptx`

> The simulator was developed and demonstrated as a prototype and has not been deployed to a public host. To try it, run it locally using the instructions below.

---

## Key Features

- **Interactive power controls:** sliders for solar generation (0 to 100 kW), essential load (5 to 50 kW) and secondary load (0 to 60 kW), plus a switch to connect or disconnect the secondary load.
- **Live grid telemetry:** total demand, net power balance (ΔP), battery state of charge (SoC) and battery status (charging, discharging, idle, curtailed).
- **Real-time 3D microgrid:** a WebGL scene showing the solar array, battery storage container, clinic and water-pump facility, and agri-processing / EV hub, connected by animated particle flows that speed up and slow down with solar output.
- **Autonomous protection logic:** automatic load shedding and shutdown rules that mirror how a real energy management system protects storage and critical loads.
- **Constraint enforcement:** the secondary load switch unchecks itself when low solar generation makes it invalid, acting as a built-in "rule enforcer" for learners.
- **Contextual alert banner:** a plain-language explanation of why an automated action just happened.
- **Multi-modal audio feedback:** Web Audio synthesized cues for load shedding and critical battery events, with no audio files required.
- **Colorblind mode:** swaps the standard red/green indicators for high-contrast alternatives.
- **Runs in any modern browser:** no installation, licences or special GPU hardware.

---

## Simulation Model

### Power balance

The microgrid is tracked continuously using the net power equation:

```
ΔP = P_Solar − (P_Essential + P_Secondary)
```

- **ΔP > 0:** surplus power, the battery charges.
- **ΔP < 0:** deficit, the battery discharges to cover the shortfall.
- **ΔP = 0:** balanced, the battery is idle.

### Battery storage

The battery energy storage system is modelled with:

| Parameter | Value |
|---|---:|
| Capacity | 100 kWh |
| Initial state of charge | 50% |
| Maximum charge power | 100 kW |
| Maximum discharge power | 100 kW |
| Simulation time step | 5 minutes (simulated) |
| Update rate | 1 update per second (real time) |

State of charge is updated every step from the energy added or drawn:

```
ΔSoC (%) = (Power × Δt / Capacity) × 100
```

SoC is clamped between 0% and 100%.

### Tiered resilience rules

| Rule | Trigger | Action |
|---|---|---|
| **Solar Priority Cutoff** | Solar generation < 25 kW | The secondary load (agri-processing and EV hub) is automatically shed to protect storage during low generation. |
| **Critical Battery Shutdown** | SoC ≤ 5% | All loads are shut down to protect the battery from deep-discharge damage. |
| **Low-reserve warning** | SoC ≤ 15% | The battery bar changes to an amber warning state to signal that reserves are running low. |
| **Full battery** | SoC = 100% with surplus power | Status is shown as curtailed (battery full). |

### Load classification and ethics

Loads are split into two classes so students learn how critical infrastructure is prioritized:

- **Essential load:** the rural clinic and water pump (public health and clean water).
- **Secondary load:** agri-milling and the EV charging hub (economic activity).

The simulation always protects essential services first, teaching the smart-city principle that public safety infrastructure takes priority over economic loads during an energy crisis.

---

## Architecture

The project uses a modular design that separates the simulation engine, the 3D visualization, and the audio feedback so that each part can be understood, tested and extended independently.

```
                    index.html  (UI, controls, simulation loop)
                         │
        ┌────────────────┼─────────────────┐
        │                │                 │
        ▼                ▼                 ▼
 batteryEngine.js   gridScene.js     audioEngine.js
 BatteryStorage     MicrogridScene   AudioSynthesizer
 System             (Three.js)       (Web Audio API)
 (state engine)          │
                         ▼
                 3D models (.glb)
        solar · battery · clinic · agri-mill
```

| Module | Class | Responsibility |
|---|---|---|
| `batteryEngine.js` | `BatteryStorageSystem` | Deterministic state engine: power balance, SoC, load shedding and shutdown rules |
| `gridScene.js` | `MicrogridScene` | Three.js scene: GLB model loading, labels, power lines, animated particle flows, orbit camera, colorblind palette |
| `audioEngine.js` | `AudioSynthesizer` | Oscillator-based alert sounds triggered on state transitions only |
| `aiCoach.js` | `MicrogridAICoach` | Experimental AI tutor module that builds a telemetry prompt for the Gemini API (see note below) |
| `index.html` | n/a | Dashboard layout, slider and toggle handling, 1-second simulation loop, wiring between modules |

---

## Educational Design

GridSense AI is designed around simulation-based learning:

- **Learning by experimentation:** students change generation and demand (for example, dropping solar output during peak demand) and observe system behaviour and failure points safely.
- **Scaffolded feedback loops:** text alerts, 3D visual flows and audio cues all reinforce the cause-and-effect link between demand and renewable availability.
- **Rule-enforcing gamification:** invalid actions are blocked or reversed automatically, and each automated action is explained in an alert banner.
- **Bridges theory and practice:** connects power engineering concepts with software engineering and embedded control logic.

---

## Accessibility and Sustainability

- **Colorblind mode:** high-contrast palette adjustments replace red/green cues.
- **Audio feedback:** acoustic cues support auditory learners and visually impaired users.
- **Dark-mode dashboard:** clean layout with controls and telemetry on the left and the 3D flow view on the right, suited to long analytical sessions.
- **Zero-install web delivery:** runs in a standard browser without licences or high-end hardware, making smart-city energy education reachable for low-resource institutions.
- **Sustainability focus:** demonstrates renewable solar integration, storage protection and the prioritization of public-safety infrastructure.

---

## Technologies Used

**Front end**
- HTML5, CSS, JavaScript (ES modules)
- Tailwind CSS (via CDN)

**3D visualization**
- Three.js r128
- OrbitControls and GLTFLoader
- GLB 3D models

**Audio**
- Web Audio API (oscillator and gain-node synthesis)

**AI (experimental)**
- Google Gemini API (`aiCoach.js`)

---

## Repository Structure

```
GridSense-AI/
│
├── README.md
│
├── index.html
├── batteryEngine.js
├── gridScene.js
├── audioEngine.js
├── aiCoach.js
│
├── solar_panels.glb
├── bess_container.glb
├── clinic_house.glb
├── agri_mill.glb
│
├── GridSense_AI_Presentation.pdf
└── GridSense_AI_Presentation.pptx
```

---

## Getting Started

### Requirements

- A modern browser (Chrome, Edge, Firefox or Safari)
- An internet connection (Tailwind CSS and Three.js are loaded from CDNs)
- A simple local web server (needed because the project uses ES modules and loads `.glb` files, which browsers block when opening `index.html` directly from disk)

### Run locally

1. Clone the repository:

```bash
git clone https://github.com/thatomaelane/GridSense-AI.git
cd GridSense-AI
```

2. Start a local server using any of the following:

```bash
# Python 3
python -m http.server 8000

# or Node.js
npx serve .
```

3. Open `http://localhost:8000` in your browser.

> If you use VS Code, the **Live Server** extension also works.

---

## How to Use the Simulator

1. Open the dashboard and review the **Grid Status Summary** (total demand, power balance and battery SoC).
2. Adjust the **Solar Array Generation**, **Essential Load** and **Secondary Load** sliders.
3. Watch the 3D scene: particle flows show power moving from the solar array to the battery, then to the clinic and the agri-processing hub. Drag to rotate the camera.
4. Try these scenarios:
   - Drop solar below **25 kW** and observe the secondary load shed automatically.
   - Keep demand above generation until the battery falls to **15%** (warning) and then **5%** (full shutdown).
   - Increase solar above total demand and watch the battery recharge until it is full.
5. Toggle **Audio Alerts** and **Colorblind Mode** from the header to explore the accessibility features.

---

## About the AI Coach Module

`aiCoach.js` contains an experimental `MicrogridAICoach` class that packages the live telemetry (solar output, loads, ΔP, SoC and shed status) into a prompt for the Google Gemini API and returns short, actionable operator guidance. It is included in the repository as the foundation for the planned AI predictive-learning features, and it is **not connected to the dashboard in the current version**. It requires your own Gemini API key. Never commit an API key to a public repository.

---

## Roadmap

- **Hardware-in-the-Loop (HIL):** link the simulator's state variables to physical ESP32 / microcontroller hardware.
- **AI predictive learning modules:** integrate day-ahead weather prediction to teach AI-driven predictive load dispatch.
- **Connect the AI coach** to the dashboard for live, contextual tutoring.
- **Learning analytics and scoring:** track learner decisions, resilience and efficiency across challenges.
- **Multi-user mode:** collaborative scenarios for classrooms.

---

## Competition Outcome

GridSense AI was submitted to the **2026 IEEE Metaverse Grand Challenge for Simulation-Based Learning** in the *Sustainable Smart Cities and Urban Innovation* category. It was not selected among the winning teams. The project remains an open prototype, and the experience of designing, building and presenting it to an international IEEE competition shaped the roadmap above.

---

## Skills Demonstrated

- Simulation and modelling of energy systems
- Renewable energy and microgrid fundamentals
- Battery energy storage and load-shedding logic
- Real-time 3D visualization with Three.js and WebGL
- Modular software architecture
- Web Audio API synthesis
- Accessible, inclusive UI/UX design
- Educational technology (EdTech) design
- Technical presentation and communication

---

## Acknowledgements

- **IEEE Metaverse**, **IEEE Young Professionals** and **IEEE Smart Cities** for organizing the Metaverse Grand Challenge for Simulation-Based Learning.
- **Three.js** (including OrbitControls and GLTFLoader) for 3D rendering.
- **Tailwind CSS** for UI styling.
- 3D model assets: *add credits for the sources of `solar_panels.glb`, `bess_container.glb`, `clinic_house.glb` and `agri_mill.glb` here, as the competition rules require publicly available assets to be credited.*

---

## Author

**Thato Maelane**

Student, Tshwane University of Technology, South Africa

Electrical Engineering | Smart Cities | Renewable Energy | Simulation

GitHub: https://github.com/thatomaelane

---

⭐ If you found this project useful, consider giving the repository a star!
