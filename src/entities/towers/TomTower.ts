import { Scene, Vector3, Color3 } from "@babylonjs/core";
import { Tower, TowerType } from "../Tower";

/**
 * Tom Tower - Illusion Magic
 * Confuses enemies, making them move slower and potentially backwards
 */
export class TomTower extends Tower {
    private confusionDuration: number = 3000; // 3 seconds

    constructor(scene: Scene, position: Vector3) {
        super(
            scene,
            position,
            TowerType.TOM,
            {
                cost: 120,
                damage: 5, // Low damage
                range: 7,
                attackSpeed: 0.8,
                sellValue: 90
            },
            new Color3(0.3, 0.8, 0.3) // Green for illusion/mystical
        );
    }

    protected attack(): void {
        if (!this.currentTarget) return;

        // Create illusion projectile
        this.createProjectile(new Color3(0.5, 1, 0.5));

        // Apply confusion: strong slow effect
        this.currentTarget.applySlow(0.7, this.confusionDuration); // 70% slow

        // Affect nearby enemies with weaker confusion
        const aoeRange = 4;
        for (const enemy of this.enemies) {
            if (!enemy.getIsAlive()) continue;
            if (enemy === this.currentTarget) continue;

            const distance = Vector3.Distance(
                this.currentTarget.getPosition(),
                enemy.getPosition()
            );

            if (distance <= aoeRange) {
                enemy.applySlow(0.3, this.confusionDuration); // 30% slow for nearby
            }
        }
    }
}
