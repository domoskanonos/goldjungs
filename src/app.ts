import { Engine, Scene } from "@babylonjs/core";
import { TowerDefenseScene } from "./scenes/TowerDefenseScene";
import "@babylonjs/inspector";

export class Game {
    private engine: Engine;
    private scene: Scene;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas, true);
        this.scene = this.createScene();
        
        // Handle window resize
        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        // Inspector Toggle
        window.addEventListener("keydown", (ev) => {
            // Shift+I to toggle
            if (ev.shiftKey && ev.key === 'I') {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }
        });
    }

    private createScene(): Scene {
        // Create Tower Defense Scene
        return new TowerDefenseScene(this.engine);
    }

    public start(): void {
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.scene.render();
            }
        });
    }
}
