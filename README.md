# CubeMaster Pro 🧩

CubeMaster Pro is an advanced, AI-powered Rubik's Cube assistant. It features multi-order support (2x2 to 5x5), computer vision scanning, AR guidance, and an interactive Free Play mode with gesture controls.

## 🌟 Key Features

1.  **Multi-Order Support**: Solves 2x2, 3x3, 4x4, and 5x5 cubes.
2.  **AI Solver**: Uses Gemini AI to generate human-readable solution steps.
3.  **Computer Vision**: Real-time camera scanning with dynamic grid overlays.
4.  **AR Guidance**: 3D step-by-step visualization of moves.
5.  **Free Play Mode**:
    *   **Touch Control**: On-screen buttons for specific layer rotations.
    *   **Gesture Control**: Contactless control using webcam motion detection (Optical Flow).
6.  **Multi-Language**: Supports English, Chinese, Spanish, French, Russian, and Arabic.

## 📂 Project Structure

### Root Files
*   **`index.html`**: Entry point. Sets up Tailwind CSS, Import Maps for React/Three.js/GenAI, and meta tags.
*   **`index.tsx`**: React application bootstrapper.
*   **`metadata.json`**: Application config, specifically requesting camera permissions.
*   **`README.md`**: This documentation.

### Core Modules

#### `App.tsx` (Main Controller)
*   Manages global state (`cubeState`, `mode`, `language`, `cubeSize`).
*   Orchestrates switching between Home, Scan, Solve, and Play modes.
*   Integrates UI components and services.

#### `types.ts` (Type Definitions)
*   Defines TypeScript interfaces for `CubeState`, `Face`, `AppMode`, `Language`, etc.
*   Ensures type safety across the application.

#### `constants.ts` (Configuration)
*   **`TRANSLATIONS`**: Dictionary for multi-language support.
*   **`LANGUAGES`**: List of supported languages and flags.
*   **`FACE_NAMES` / `COLORS`**: Visual mapping constants.
*   **`getInitialCubeState`**: Helper to generate unsolved states for N*N cubes.

### Components

#### `components/Scanner.tsx` (Vision System)
*   Handles camera stream for scanning cube faces.
*   Provides dynamic grid overlay based on `cubeSize`.
*   Captures frames and allows manual color correction.

#### `components/Cube3D.tsx` (Visualization)
*   Renders the 3D Cube using **React Three Fiber**.
*   Dynamically builds the voxel grid based on `size` (2-5).
*   Handles 3D interaction (orbit controls).

#### `components/GestureControl.tsx` (Input System)
*   **Optical Flow Algorithm**: Analyzes webcam frames to detect motion direction (Up/Down/Left/Right).
*   Triggers callbacks to rotate cube layers without touching the screen.
*   Lightweight implementation (no heavy ML libraries required).

### Services

#### `services/geminiService.ts` (AI Logic)
*   Interacts with Google Gemini API.
*   Converts `CubeState` to a text prompt.
*   Parses the AI's JSON response into executable `SolveStep` instructions.

#### `services/cubeLogic.ts` (Cube Math)
*   **`rotateFace`**: The core mathematical engine.
*   Handles matrix rotation of a face grid.
*   Calculates complex adjacent face permutations for N*N cubes to simulate rotation logic.

## 🚀 How It Works

1.  **Scanning**: The user photographs all 6 faces. The app validates colors.
2.  **Solving**: The state is sent to Gemini 2.5 Flash, which returns a solution algorithm (CFOP, Reduction, etc.).
3.  **Guiding**: The app parses the moves (e.g., "R U R'") and updates the 3D model in real-time while the user follows along.
4.  **Playing**: In Free Play, `cubeLogic` mutates the state locally, allowing the user to scramble and solve the virtual cube using buttons or hand gestures.

## 🛠 Tech Stack

*   **Frontend**: React 19, Tailwind CSS
*   **3D**: Three.js, React Three Fiber
*   **AI**: Google GenAI SDK (Gemini 2.5 Flash)
*   **Vision**: Native MediaStream API + Canvas API
