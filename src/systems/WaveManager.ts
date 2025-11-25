import { Scene, Color3 } from "@babylonjs/core";
import { Enemy, EnemyType, EnemyStats } from "../entities/Enemy";
import { PathSystem } from "./PathSystem";
import { GameManager, GameState } from "./GameManager";

interface WaveDefinition {
    enemies: {
        type: EnemyType;
        count: number;
        spawnDelay: number; // Delay between spawns in ms
    }[];
}

export class WaveManager {
    private scene: Scene;
    private pathSystem: PathSystem;
    private gameManager: GameManager;
    
    private waves: WaveDefinition[];
    private currentWaveEnemies: Enemy[] = [];
    private isSpawning: boolean = false;
    private waveInProgress: boolean = false;
    
    private onWaveCompleteCallbacks: (() => void)[] = [];
    private onAllWavesCompleteCallbacks: (() => void)[] = [];

    constructor(scene: Scene, pathSystem: PathSystem) {
        this.scene = scene;
        this.pathSystem = pathSystem;
        this.gameManager = GameManager.getInstance();
        
        this.waves = this.createWaveDefinitions();
    }

    private createWaveDefinitions(): WaveDefinition[] {
        return [
            // Wave 1 - Easy start
            {
                enemies: [
                    { type: EnemyType.SCHATTENWESEN, count: 5, spawnDelay: 1000 }
                ]
            },
            // Wave 2
            {
                enemies: [
                    { type: EnemyType.SCHATTENWESEN, count: 8, spawnDelay: 800 }
                ]
            },
            // Wave 3 - Introduce Daemons
            {
                enemies: [
                    { type: EnemyType.SCHATTENWESEN, count: 5, spawnDelay: 1000 },
                    { type: EnemyType.DAEMON, count: 3, spawnDelay: 1500 }
                ]
            },
            // Wave 4
            {
                enemies: [
                    { type: EnemyType.VERDERBTE, count: 6, spawnDelay: 1000 }
                ]
            },
            // Wave 5 - Mixed
            {
                enemies: [
                    { type: EnemyType.SCHATTENWESEN, count: 10, spawnDelay: 600 },
                    { type: EnemyType.DAEMON, count: 4, spawnDelay: 1200 }
                ]
            },
            // Wave 6 - Introduce Gefallene
            {
                enemies: [
                    { type: EnemyType.GEFALLENE, count: 5, spawnDelay: 1000 },
                    { type: EnemyType.VERDERBTE, count: 5, spawnDelay: 1000 }
                ]
            },
            // Wave 7 - Introduce Hüllen
            {
                enemies: [
                    { type: EnemyType.HUELLEN, count: 8, spawnDelay: 800 }
                ]
            },
            // Wave 8 - Heavy wave
            {
                enemies: [
                    { type: EnemyType.DAEMON, count: 6, spawnDelay: 1000 },
                    { type: EnemyType.GEFALLENE, count: 6, spawnDelay: 1000 }
                ]
            },
            // Wave 9 - Introduce Untote
            {
                enemies: [
                    { type: EnemyType.UNTOTE, count: 10, spawnDelay: 700 }
                ]
            },
            // Wave 10 - Final boss wave
            {
                enemies: [
                    { type: EnemyType.SCHATTENWESEN, count: 10, spawnDelay: 500 },
                    { type: EnemyType.DAEMON, count: 5, spawnDelay: 800 },
                    { type: EnemyType.VERDERBTE, count: 5, spawnDelay: 800 },
                    { type: EnemyType.GEFALLENE, count: 5, spawnDelay: 800 },
                    { type: EnemyType.HUELLEN, count: 5, spawnDelay: 800 },
                    { type: EnemyType.UNTOTE, count: 5, spawnDelay: 800 }
                ]
            }
        ];
    }

    private getEnemyStats(type: EnemyType): EnemyStats {
        switch (type) {
            case EnemyType.SCHATTENWESEN:
                return {
                    maxHealth: 50,
                    speed: 0.08,
                    armor: 0,
                    goldReward: 10,
                    scoreReward: 10,
                    damageToBase: 1
                };
            case EnemyType.DAEMON:
                return {
                    maxHealth: 100,
                    speed: 0.06,
                    armor: 5,
                    goldReward: 20,
                    scoreReward: 25,
                    damageToBase: 2
                };
            case EnemyType.VERDERBTE:
                return {
                    maxHealth: 80,
                    speed: 0.1,
                    armor: 2,
                    goldReward: 15,
                    scoreReward: 15,
                    damageToBase: 1
                };
            case EnemyType.GEFALLENE:
                return {
                    maxHealth: 150,
                    speed: 0.05,
                    armor: 10,
                    goldReward: 30,
                    scoreReward: 40,
                    damageToBase: 3
                };
            case EnemyType.HUELLEN:
                return {
                    maxHealth: 60,
                    speed: 0.12,
                    armor: 0,
                    goldReward: 12,
                    scoreReward: 12,
                    damageToBase: 1
                };
            case EnemyType.UNTOTE:
                return {
                    maxHealth: 120,
                    speed: 0.04,
                    armor: 8,
                    goldReward: 25,
                    scoreReward: 30,
                    damageToBase: 2
                };
        }
    }

    private getEnemyColor(type: EnemyType): Color3 {
        switch (type) {
            case EnemyType.SCHATTENWESEN:
                return new Color3(0.2, 0.2, 0.2); // Dark gray
            case EnemyType.DAEMON:
                return new Color3(0.8, 0.1, 0.1); // Dark red
            case EnemyType.VERDERBTE:
                return new Color3(0.4, 0.2, 0.6); // Purple
            case EnemyType.GEFALLENE:
                return new Color3(0.6, 0.6, 0.2); // Dark yellow
            case EnemyType.HUELLEN:
                return new Color3(0.1, 0.3, 0.3); // Dark teal
            case EnemyType.UNTOTE:
                return new Color3(0.3, 0.5, 0.2); // Sickly green
        }
    }

    public async startNextWave(): Promise<void> {
        if (this.isSpawning || this.waveInProgress) {
            console.warn("Wave already in progress");
            return;
        }

        const currentWave = this.gameManager.getCurrentWave();
        
        if (currentWave >= this.waves.length) {
            // All waves complete!
            this.onAllWavesCompleteCallbacks.forEach(cb => cb());
            this.gameManager.setGameState(GameState.VICTORY);
            return;
        }

        this.gameManager.nextWave();
        const waveDefinition = this.waves[currentWave];
        
        this.isSpawning = true;
        this.waveInProgress = true;
        this.currentWaveEnemies = [];

        // Spawn all enemy groups
        for (const enemyGroup of waveDefinition.enemies) {
            await this.spawnEnemyGroup(
                enemyGroup.type,
                enemyGroup.count,
                enemyGroup.spawnDelay
            );
        }

        this.isSpawning = false;
        
        // Monitor wave completion
        this.monitorWaveCompletion();
    }

    private spawnEnemyGroup(
        type: EnemyType,
        count: number,
        spawnDelay: number
    ): Promise<void> {
        return new Promise((resolve) => {
            let spawned = 0;
            
            const spawnInterval = setInterval(() => {
                if (spawned >= count) {
                    clearInterval(spawnInterval);
                    resolve();
                    return;
                }

                const enemy = new Enemy(
                    this.scene,
                    this.pathSystem,
                    type,
                    this.getEnemyStats(type),
                    this.getEnemyColor(type)
                );

                this.currentWaveEnemies.push(enemy);
                spawned++;
            }, spawnDelay);
        });
    }

    private monitorWaveCompletion(): void {
        const checkInterval = setInterval(() => {
            // Check if all enemies are dead or reached end
            const allEnemiesDone = this.currentWaveEnemies.every(
                enemy => !enemy.getIsAlive()
            );

            if (allEnemiesDone) {
                clearInterval(checkInterval);
                this.waveInProgress = false;
                this.onWaveCompleteCallbacks.forEach(cb => cb());
            }
        }, 500);
    }

    public getCurrentWaveEnemies(): Enemy[] {
        return this.currentWaveEnemies.filter(enemy => enemy.getIsAlive());
    }

    public isWaveInProgress(): boolean {
        return this.waveInProgress;
    }

    public onWaveComplete(callback: () => void): void {
        this.onWaveCompleteCallbacks.push(callback);
    }

    public onAllWavesComplete(callback: () => void): void {
        this.onAllWavesCompleteCallbacks.push(callback);
    }
}
