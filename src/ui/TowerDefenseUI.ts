import { WaveManager } from "../systems/WaveManager";
import { TowerPlacementSystem } from "../systems/TowerPlacementSystem";
import { GameManager, GameState } from "../systems/GameManager";
import { NicoTower } from "../entities/towers/NicoTower";
import { LarsTower } from "../entities/towers/LarsTower";
import { PaulinaTower } from "../entities/towers/PaulinaTower";
import { TomTower } from "../entities/towers/TomTower";

export class TowerDefenseUI {
    private waveManager: WaveManager;
    private placementSystem: TowerPlacementSystem;
    private gameManager: GameManager;
    
    private container!: HTMLDivElement;
    private goldDisplay!: HTMLDivElement;
    private livesDisplay!: HTMLDivElement;
    private waveDisplay!: HTMLDivElement;
    private startWaveButton!: HTMLButtonElement;

    constructor(
        waveManager: WaveManager,
        placementSystem: TowerPlacementSystem,
        gameManager: GameManager
    ) {
        this.waveManager = waveManager;
        this.placementSystem = placementSystem;
        this.gameManager = gameManager;

        this.createUI();
        this.setupEventListeners();
    }

    private createUI(): void {
        // Main container
        this.container = document.createElement("div");
        this.container.style.position = "fixed";
        this.container.style.top = "0";
        this.container.style.left = "0";
        this.container.style.width = "100%";
        this.container.style.height = "100%";
        this.container.style.pointerEvents = "none";
        this.container.style.fontFamily = "Arial, sans-serif";
        this.container.style.color = "white";
        document.body.appendChild(this.container);

        // Top bar
        const topBar = document.createElement("div");
        topBar.style.position = "absolute";
        topBar.style.top = "10px";
        topBar.style.left = "50%";
        topBar.style.transform = "translateX(-50%)";
        topBar.style.display = "flex";
        topBar.style.gap = "20px";
        topBar.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        topBar.style.padding = "10px 20px";
        topBar.style.borderRadius = "10px";
        this.container.appendChild(topBar);

        // Gold display
        this.goldDisplay = document.createElement("div");
        this.goldDisplay.innerHTML = `💰 Gold: <span id="goldAmount">${this.gameManager.getGold()}</span>`;
        this.goldDisplay.style.fontSize = "18px";
        this.goldDisplay.style.fontWeight = "bold";
        topBar.appendChild(this.goldDisplay);

        // Lives display
        this.livesDisplay = document.createElement("div");
        this.livesDisplay.innerHTML = `❤️ Lives: <span id="livesAmount">${this.gameManager.getLives()}</span>`;
        this.livesDisplay.style.fontSize = "18px";
        this.livesDisplay.style.fontWeight = "bold";
        topBar.appendChild(this.livesDisplay);

        // Wave display
        this.waveDisplay = document.createElement("div");
        this.waveDisplay.innerHTML = `🌊 Wave: <span id="waveNumber">${this.gameManager.getCurrentWave()}</span>/10`;
        this.waveDisplay.style.fontSize = "18px";
        this.waveDisplay.style.fontWeight = "bold";
        topBar.appendChild(this.waveDisplay);

        // Tower selection panel
        const towerPanel = document.createElement("div");
        towerPanel.style.position = "absolute";
        towerPanel.style.bottom = "20px";
        towerPanel.style.left = "50%";
        towerPanel.style.transform = "translateX(-50%)";
        towerPanel.style.display = "flex";
        towerPanel.style.gap = "10px";
        towerPanel.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        towerPanel.style.padding = "15px";
        towerPanel.style.borderRadius = "10px";
        towerPanel.style.pointerEvents = "auto";
        this.container.appendChild(towerPanel);

        // Tower buttons
        this.createTowerButton(towerPanel, "Nico", "💧", 100, NicoTower, "Water/Wind - Slows enemies");
        this.createTowerButton(towerPanel, "Lars", "🔥", 150, LarsTower, "Fire - High damage");
        this.createTowerButton(towerPanel, "Paulina", "🥋", 80, PaulinaTower, "Karate - Fast melee");
        this.createTowerButton(towerPanel, "Tom", "✨", 120, TomTower, "Illusion - Confuses enemies");

        // Start wave button
        this.startWaveButton = document.createElement("button");
        this.startWaveButton.textContent = "Start Wave";
        this.startWaveButton.style.position = "absolute";
        this.startWaveButton.style.top = "80px";
        this.startWaveButton.style.right = "20px";
        this.startWaveButton.style.padding = "15px 30px";
        this.startWaveButton.style.fontSize = "18px";
        this.startWaveButton.style.fontWeight = "bold";
        this.startWaveButton.style.backgroundColor = "#4CAF50";
        this.startWaveButton.style.color = "white";
        this.startWaveButton.style.border = "none";
        this.startWaveButton.style.borderRadius = "8px";
        this.startWaveButton.style.cursor = "pointer";
        this.startWaveButton.style.pointerEvents = "auto";
        this.startWaveButton.onclick = () => this.startWave();
        this.container.appendChild(this.startWaveButton);
    }

    private createTowerButton(
        parent: HTMLElement,
        name: string,
        icon: string,
        cost: number,
        towerClass: any,
        description: string
    ): void {
        const button = document.createElement("button");
        button.style.padding = "10px 15px";
        button.style.fontSize = "16px";
        button.style.backgroundColor = "rgba(50, 50, 50, 0.9)";
        button.style.color = "white";
        button.style.border = "2px solid #666";
        button.style.borderRadius = "8px";
        button.style.cursor = "pointer";
        button.style.transition = "all 0.2s";
        button.title = description;

        button.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 24px;">${icon}</div>
                <div style="font-size: 14px; margin-top: 5px;">${name}</div>
                <div style="font-size: 12px; color: #FFD700;">💰${cost}</div>
            </div>
        `;

        button.onmouseover = () => {
            button.style.backgroundColor = "rgba(80, 80, 80, 0.9)";
            button.style.borderColor = "#999";
        };

        button.onmouseout = () => {
            button.style.backgroundColor = "rgba(50, 50, 50, 0.9)";
            button.style.borderColor = "#666";
        };

        button.onclick = () => {
            this.placementSystem.setSelectedTowerType(towerClass);
            console.log(`Selected ${name} tower`);
        };

        parent.appendChild(button);
    }

    private setupEventListeners(): void {
        // Update displays when game state changes
        this.gameManager.onGoldChanged((gold) => {
            const goldElement = document.getElementById("goldAmount");
            if (goldElement) goldElement.textContent = gold.toString();
        });

        this.gameManager.onLivesChanged((lives) => {
            const livesElement = document.getElementById("livesAmount");
            if (livesElement) livesElement.textContent = lives.toString();
        });

        this.gameManager.onWaveChanged((wave) => {
            const waveElement = document.getElementById("waveNumber");
            if (waveElement) waveElement.textContent = wave.toString();
        });

        this.gameManager.onGameStateChanged((state) => {
            if (state === GameState.GAME_OVER) {
                this.showGameOver();
            } else if (state === GameState.VICTORY) {
                this.showVictory();
            }
        });

        this.waveManager.onWaveComplete(() => {
            this.startWaveButton.disabled = false;
            this.startWaveButton.style.backgroundColor = "#4CAF50";
        });

        // Keyboard shortcuts
        window.addEventListener("keydown", (evt) => {
            if (evt.key === "1") this.placementSystem.setSelectedTowerType(NicoTower);
            if (evt.key === "2") this.placementSystem.setSelectedTowerType(LarsTower);
            if (evt.key === "3") this.placementSystem.setSelectedTowerType(PaulinaTower);
            if (evt.key === "4") this.placementSystem.setSelectedTowerType(TomTower);
            if (evt.key === "Escape") this.placementSystem.setSelectedTowerType(null);
            if (evt.key === " ") {
                evt.preventDefault();
                this.startWave();
            }
        });
    }

    private startWave(): void {
        if (this.waveManager.isWaveInProgress()) return;

        this.waveManager.startNextWave();
        this.startWaveButton.disabled = true;
        this.startWaveButton.style.backgroundColor = "#999";
    }

    private showGameOver(): void {
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.pointerEvents = "auto";

        overlay.innerHTML = `
            <h1 style="color: red; font-size: 48px; margin-bottom: 20px;">GAME OVER</h1>
            <p style="color: white; font-size: 24px;">Score: ${this.gameManager.getScore()}</p>
            <button id="restartButton" style="margin-top: 30px; padding: 15px 40px; font-size: 20px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 8px;">
                Restart
            </button>
        `;

        this.container.appendChild(overlay);

        document.getElementById("restartButton")!.onclick = () => {
            location.reload();
        };
    }

    private showVictory(): void {
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 50, 0, 0.8)";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.pointerEvents = "auto";

        overlay.innerHTML = `
            <h1 style="color: gold; font-size: 48px; margin-bottom: 20px;">VICTORY!</h1>
            <p style="color: white; font-size: 24px;">Score: ${this.gameManager.getScore()}</p>
            <p style="color: white; font-size: 18px;">You defended against all waves!</p>
            <button id="restartButton" style="margin-top: 30px; padding: 15px 40px; font-size: 20px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 8px;">
                Play Again
            </button>
        `;

        this.container.appendChild(overlay);

        document.getElementById("restartButton")!.onclick = () => {
            location.reload();
        };
    }
}
