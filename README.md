<div align="center">
  <h1 align="center">🛰️ Vanguard Orbit</h1>
  <p align="center">
    <strong>Big Data Space Debris Predictor & Autonomous Evasive AI</strong>
  </p>
  
  <img src="https://img.shields.io/badge/Apache_Spark-FFFFFF?style=for-the-badge&logo=apachespark&logoColor=#E35A16" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white" />
</div>

<br />

## 🪐 Project Overview

**Vanguard Orbit** is a full-stack, enterprise-grade aerospace analytics platform designed to predict catastrophic satellite collisions and autonomously generate evasive maneuvers in real-time. 

Built on a robust **Lambda Architecture**, the system decouples heavy physics calculations from the user interface. It utilizes Apache Spark (PySpark) to crunch live telemetry data, SQLite for persistent state management, and Google Gemini 2.5 Flash to act as an autonomous orbital traffic controller.

> **[DRAG AND DROP YOUR HERO SCREENSHOT HERE]**
> *(e.g., The 3D spinning globe screenshot)*

---

## ✨ Core Features

- 📡 **Live Data Lake Ingestion:** Authenticates with the US Space Command to stream live JSON orbital telemetry.
- 🧮 **PySpark Physics Engine:** Utilizes the SGP4 algorithm and Julian Date conversions to calculate exact Cartesian coordinates (X,Y,Z) for 1,000+ satellites.
- 🤖 **Machine Learning Risk Prediction:** Applies a Logistic Regression model with L2 Penalty (Ridge) to filter atmospheric noise and isolate high-risk trajectories.
- 🧠 **Autonomous Evasive AI:** Generates strict, real-time Delta-V thruster burn sequences using Google Gemini 2.5 Flash.
- 🕶️ **High-Performance WebGL HUD:** Renders thousands of active satellites at 60 FPS using React, Tailwind CSS, and Three.js `InstancedMesh` with dead-reckoning interpolation.

> **[DRAG AND DROP YOUR AI TERMINAL SCREENSHOT / GIF HERE]**
> *(e.g., The screenshot of the red Target Lock scanner)*

---

## 🏗️ System Architecture

1. **Offline Pipeline (Batch):** PySpark ingests TLE data $\rightarrow$ Runs SGP4 Physics $\rightarrow$ Evaluates Risk Model $\rightarrow$ Commits to SQLite Database.
2. **Online Pipeline (Speed):** FastAPI queries SQLite $\rightarrow$ Parses to Gemini AI $\rightarrow$ Serves to React Frontend.
3. **Client Interpolation:** Frontend bypasses DOM bottlenecks by processing orbital velocity vectors natively on the GPU.

---

## 🚀 Local Deployment

### 2. Backend Setup (Python)
```bash
# Create virtual environment
python -m venv venv

# Activate on Windows:
venv\Scripts\activate
# Activate on Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your Google Gemini API Key
echo "GEMINI_API_KEY=your_key_here" > .env

# Run the Big Data Pipeline to build the database
python data_pipeline.py

# Boot the FastAPI Server
python main.py

### 1. Clone the Repository
```bash
git clone [https://github.com/YourUsername/Vanguard-Orbit.git](https://github.com/YourUsername/Vanguard-Orbit.git)
cd Vanguard-Orbit