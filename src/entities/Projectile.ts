import { Scene, Vector3, Mesh, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";
import { Enemy } from "./Enemy";

export class Projectile {
    private mesh: Mesh;
    private target: Enemy;
    private damage: number;
    private speed: number;
    private isActive: boolean = true;
    private onHitCallback?: () => void;

    constructor(
        scene: Scene,
        startPosition: Vector3,
        target: Enemy,
        damage: number,
        speed: number = 0.5,
        color: Color3 = new Color3(1, 1, 0),
        onHit?: () => void
    ) {
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.onHitCallback = onHit;

        // Create projectile mesh
        this.mesh = MeshBuilder.CreateSphere("projectile", { diameter: 0.3 }, scene);
        this.mesh.position = startPosition.clone();

        const material = new StandardMaterial("projectileMat", scene);
        material.diffuseColor = color;
        material.emissiveColor = color.scale(0.5);
        this.mesh.material = material;

        // Register update loop
        scene.onBeforeRenderObservable.add(() => {
            if (this.isActive) {
                this.update();
            }
        });
    }

    private update(): void {
        if (!this.target.getIsAlive()) {
            this.destroy();
            return;
        }

        const targetPosition = this.target.getPosition();
        const direction = targetPosition.subtract(this.mesh.position);
        const distance = direction.length();

        if (distance <= this.speed) {
            // Hit target
            this.hit();
        } else {
            // Move toward target
            const normalizedDirection = direction.normalize();
            this.mesh.position.addInPlace(normalizedDirection.scale(this.speed));
        }
    }

    private hit(): void {
        if (!this.isActive) return;

        this.target.takeDamage(this.damage);
        
        if (this.onHitCallback) {
            this.onHitCallback();
        }

        this.destroy();
    }

    private destroy(): void {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.mesh.dispose();
    }
}
