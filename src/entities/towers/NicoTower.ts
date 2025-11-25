import { Scene, Vector3, Color3 } from "@babylonjs/core";
import { Tower, TowerType } from "../Tower";

/**
 * Nico Tower - Water/Wind Element
 * Slows enemies in an area of effect
 */
export class NicoTower extends Tower {
    private slowAmount: number = 0.5; // 50% slow
    private slowDuration: number = 2000; // 2 seconds

    constructor(scene: Scene, position: Vector3) {
        super(
            scene,
            position,
            TowerType.NICO,
            {
                cost: 100,
                damage: 10,
                range: 8,
                attackSpeed: 1, // 1 attack per second
                sellValue: 75
            },
            new Color3(0.2, 0.5, 1) // Blue for water/wind
        );
    }

    protected attack(): void {
        if (!this.currentTarget) return;

        // Create projectile
        this.createProjectile(new Color3(0.5, 0.8, 1));

        // Apply slow effect to target
        this.currentTarget.applySlow(this.slowAmount, this.slowDuration);

        // Area effect: slow nearby enemies
        const aoeRange = 3;
        for (const enemy of this.enemies) {
            if (!enemy.getIsAlive()) continue;
            if (enemy === this.currentTarget) continue;

            const distance = Vector3.Distance(
                this.currentTarget.getPosition(),
                enemy.getPosition()
            );

            if (distance <= aoeRange) {
                enemy.applySlow(this.slowAmount * 0.5, this.slowDuration);
            }
        }
    }
}
