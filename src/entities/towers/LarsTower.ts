import { Scene, Vector3, Color3 } from "@babylonjs/core";
import { Tower, TowerType } from "../Tower";

/**
 * Lars Tower - Fire Element
 * High single-target damage
 */
export class LarsTower extends Tower {
    constructor(scene: Scene, position: Vector3) {
        super(
            scene,
            position,
            TowerType.LARS,
            {
                cost: 150,
                damage: 40,
                range: 6,
                attackSpeed: 0.5, // 0.5 attacks per second (slower but powerful)
                sellValue: 110
            },
            new Color3(1, 0.3, 0) // Red/orange for fire
        );
    }

    protected attack(): void {
        if (!this.currentTarget) return;

        // Create fire projectile
        this.createProjectile(new Color3(1, 0.5, 0));
    }
}
