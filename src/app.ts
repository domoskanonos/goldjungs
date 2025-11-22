import { Engine, Scene } from "@babylonjs/core";
import { ArkadienScene } from "./scenes/ArkadienScene";
// import "@babylonjs/inspector"; // Uncomment to enable inspector

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
    }

    private createScene(): Scene {
        // Start with Arkadien
        return new ArkadienScene(this.engine);
    }

    public start(): void {
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.scene.render();
            }
        });
    }
}
