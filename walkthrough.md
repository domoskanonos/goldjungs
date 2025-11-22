# Goldjungs 3D - Setup Walkthrough

## Overview
This initial setup establishes the core architecture for the Goldjungs browser game using **Babylon.js** and **Vite**.

## What's Implemented
1.  **Project Structure**:
    - `src/main.ts`: Entry point.
    - `src/app.ts`: Game loop manager.
    - `src/scenes/ArkadienScene.ts`: The starting planet (Arkadien).
    - `src/characters/Player.ts`: Player controller.

2.  **Game Features**:
    - **3D Environment**: A basic ground and skybox representing Arkadien.
    - **Player Character**: A capsule mesh representing the hero (Leonas/Lars/etc.).
    - **Controls**: WASD / Arrow Keys to move.
    - **Camera**: 3rd person camera that follows the player.

## How to Run
1.  Open a terminal.
2.  Run `npm run dev`.
3.  Open the link shown (usually `http://localhost:5173`).

## Controls & Settings
- **Movement**: WASD or Arrow Keys.
- **Settings**: Click the "⚙ Settings" button in the top right corner to rebind keys.
- **Debugging**: Press **Shift + I** to toggle the Inspector.

## Next Steps
- Add character models (replace capsule).
- Implement planet switching (Finstoria/Silvania).
- Add UI for character selection.
