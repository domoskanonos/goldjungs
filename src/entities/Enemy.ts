import { Scene, Vector3, Mesh, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";
import { PathSystem } from "../systems/PathSystem";
import { GameManager } from "../systems/GameManager";

export enum EnemyType {
    SCHATTENWESEN = "Schattenwesen",
    DAEMON = "Dämon",
    VERDERBTE = "Verderbte",
    GEFALLENE = "Gefallene",
    HUELLEN = "Hüllen",
    UNTOTE = "Untote"
}

export interface EnemyStats {
    maxHealth: number;
    speed: number;
    armor: number;
    goldReward: number;
    scoreReward: number;
    damageToBase: number;
}

export class Enemy {
    public mesh: Mesh;
    protected scene: Scene;
    protected pathSystem: PathSystem;
    
    protected maxHealth: number;
    protected currentHealth: number;
    protected baseSpeed: number;
    protected currentSpeed: number;
    protected armor: number;
    protected goldReward: number;
    protected scoreReward: number;
    protected damageToBase: number;
    
    protected currentWaypointIndex: number = 0;
    protected isAlive: boolean = true;
    protected slowEffect: number = 1.0; // Multiplier for speed (1.0 = normal, 0.5 = 50% slow)
    
    public type: EnemyType;

    constructor(
        scene: Scene,
        pathSystem: PathSystem,
        type: EnemyType,
        stats: EnemyStats,
        color: Color3
    ) {
        this.scene = scene;
        this.pathSystem = pathSystem;
        this.type = type;
        
        this.maxHealth = stats.maxHealth;
        this.currentHealth = stats.maxHealth;
        this.baseSpeed = stats.speed;
        this.currentSpeed = stats.speed;
        this.armor = stats.armor;
        this.goldReward = stats.goldReward;
        this.scoreReward = stats.scoreReward;
        this.damageToBase = stats.damageToBase;

        // Create mesh
        this.mesh = MeshBuilder.CreateSphere(`enemy_${type}`, { diameter: 1 }, scene);
        this.mesh.position = pathSystem.getStartPosition().clone();
        
        const material = new StandardMaterial(`enemyMat_${type}`, scene);
        material.diffuseColor = color;
        material.emissiveColor = color.scale(0.3);
        this.mesh.material = material;

        // Register update loop
        scene.onBeforeRenderObservable.add(() => {
            if (this.isAlive) {
                this.update();
            }
        });
    }

    protected update(): void {
        // Move along path
        const result = this.pathSystem.moveAlongPath(
            this.mesh.position,
            this.currentWaypointIndex,
            this.currentSpeed * this.slowEffect
        );

        this.mesh.position = result.position;
        this.currentWaypointIndex = result.waypointIndex;

        if (result.completed) {
            this.reachedEnd();
        }
    }

    public takeDamage(damage: number): void {
        if (!this.isAlive) return;

        // Apply armor reduction
        const actualDamage = Math.max(1, damage - this.armor);
        this.currentHealth -= actualDamage;

        if (this.currentHealth <= 0) {
            this.die();
        }
    }

    public applySlow(slowAmount: number, duration: number): void {
        this.slowEffect = Math.min(this.slowEffect, 1 - slowAmount);
        this.currentSpeed = this.baseSpeed * this.slowEffect;

        // Reset slow after duration
        setTimeout(() => {
            this.slowEffect = 1.0;
            this.currentSpeed = this.baseSpeed;
        }, duration);
    }

    protected die(): void {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        
        // Reward player
        const gameManager = GameManager.getInstance();
        gameManager.addGold(this.goldReward);
        gameManager.addScore(this.scoreReward);
        
        // Remove from scene
        this.mesh.dispose();
    }

    protected reachedEnd(): void {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        
        // Damage player base
        const gameManager = GameManager.getInstance();
        gameManager.loseLife(this.damageToBase);
        
        // Remove from scene
        this.mesh.dispose();
    }

    public getHealth(): number {
        return this.currentHealth;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public getIsAlive(): boolean {
        return this.isAlive;
    }

    public getPosition(): Vector3 {
        return this.mesh.position;
    }
}
