import { Scene, Vector3, Mesh, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";
import { Enemy } from "./Enemy";
import { Projectile } from "./Projectile";

export enum TowerType {
    NICO = "Nico",
    LARS = "Lars",
    PAULINA = "Paulina",
    TOM = "Tom"
}

export interface TowerStats {
    cost: number;
    damage: number;
    range: number;
    attackSpeed: number; // Attacks per second
    sellValue: number;
}

export abstract class Tower {
    public mesh: Mesh;
    protected scene: Scene;
    protected position: Vector3;
    
    protected cost: number;
    protected damage: number;
    protected range: number;
    protected attackSpeed: number;
    protected sellValue: number;
    
    protected currentTarget: Enemy | null = null;
    protected attackCooldown: number = 0;
    protected enemies: Enemy[] = [];
    
    public type: TowerType;
    public level: number = 1;

    constructor(
        scene: Scene,
        position: Vector3,
        type: TowerType,
        stats: TowerStats,
        color: Color3
    ) {
        this.scene = scene;
        this.position = position.clone();
        this.type = type;
        
        this.cost = stats.cost;
        this.damage = stats.damage;
        this.range = stats.range;
        this.attackSpeed = stats.attackSpeed;
        this.sellValue = stats.sellValue;

        // Create tower mesh (cylinder for now)
        this.mesh = MeshBuilder.CreateCylinder(
            `tower_${type}`,
            { height: 2, diameter: 1 },
            scene
        );
        this.mesh.position = position.clone();
        
        const material = new StandardMaterial(`towerMat_${type}`, scene);
        material.diffuseColor = color;
        material.emissiveColor = color.scale(0.2);
        this.mesh.material = material;

        // Register update loop
        scene.onBeforeRenderObservable.add(() => {
            this.update();
        });
    }

    protected update(): void {
        // Update cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= 1 / 60; // Assuming 60 FPS
        }

        // Find target
        this.findTarget();

        // Attack if ready
        if (this.currentTarget && this.attackCooldown <= 0) {
            this.attack();
            this.attackCooldown = 1 / this.attackSpeed;
        }
    }

    protected findTarget(): void {
        // Clear current target if dead or out of range
        if (this.currentTarget) {
            if (!this.currentTarget.getIsAlive() || 
                Vector3.Distance(this.position, this.currentTarget.getPosition()) > this.range) {
                this.currentTarget = null;
            }
        }

        // Find new target if needed
        if (!this.currentTarget) {
            let closestEnemy: Enemy | null = null;
            let closestDistance = Infinity;

            for (const enemy of this.enemies) {
                if (!enemy.getIsAlive()) continue;

                const distance = Vector3.Distance(this.position, enemy.getPosition());
                if (distance <= this.range && distance < closestDistance) {
                    closestEnemy = enemy;
                    closestDistance = distance;
                }
            }

            this.currentTarget = closestEnemy;
        }
    }

    protected abstract attack(): void;

    public setEnemies(enemies: Enemy[]): void {
        this.enemies = enemies;
    }

    public getCost(): number {
        return this.cost;
    }

    public getSellValue(): number {
        return this.sellValue;
    }

    public getRange(): number {
        return this.range;
    }

    public dispose(): void {
        this.mesh.dispose();
    }

    protected createProjectile(color: Color3): void {
        if (!this.currentTarget) return;

        new Projectile(
            this.scene,
            this.mesh.position.add(new Vector3(0, 1, 0)),
            this.currentTarget,
            this.damage,
            0.5,
            color
        );
    }
}
