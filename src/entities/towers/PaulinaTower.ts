import { Scene, Vector3, Color3, MeshBuilder, StandardMaterial } from "@babylonjs/core";
import { Tower, TowerType } from "../Tower";

/**
 * Paulina Tower - Karate/Melee
 * Fast attack speed, short range
 */
export class PaulinaTower extends Tower {
    constructor(scene: Scene, position: Vector3) {
        super(
            scene,
            position,
            TowerType.PAULINA,
            {
                cost: 80,
                damage: 15,
                range: 3, // Short melee range
                attackSpeed: 2, // 2 attacks per second (very fast)
                sellValue: 60
            },
            new Color3(0.6, 0.2, 0.8) // Purple for karate
        );
    }

    protected attack(): void {
        if (!this.currentTarget) return;

        // Melee attack - no projectile, instant damage
        this.currentTarget.takeDamage(this.damage);

        // Visual effect: quick flash
        const effect = MeshBuilder.CreateSphere(
            "melee_effect",
            { diameter: 0.5 },
            this.scene
        );
        effect.position = this.currentTarget.getPosition().clone();
        
        const material = new StandardMaterial("meleeMat", this.scene);
        material.diffuseColor = new Color3(0.8, 0.4, 1);
        material.emissiveColor = new Color3(0.8, 0.4, 1);
        effect.material = material;

        // Remove effect after short delay
        setTimeout(() => {
            effect.dispose();
        }, 100);
    }
}
