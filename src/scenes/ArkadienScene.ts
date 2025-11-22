import { Scene, Engine, Vector3, HemisphericLight, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";
import { Player } from "../characters/Player";

import { InputManager } from "../core/InputManager";
import { SettingsUI } from "../ui/SettingsUI";

export class ArkadienScene extends Scene {
    public inputManager: InputManager;

    constructor(engine: Engine) {
        super(engine);
        this.inputManager = new InputManager(this);
        new SettingsUI(this.inputManager);
        
        this.createEnvironment();
        this.createPlayer();
        this.collisionsEnabled = true;
    }

    private createEnvironment() {
        // Light
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this);
        light.intensity = 0.7;

        // Ground
        const ground = MeshBuilder.CreateGround("ground", {width: 100, height: 100}, this);
        const groundMat = new StandardMaterial("groundMat", this);
        groundMat.diffuseColor = new Color3(0.2, 0.8, 0.2); // Green grass
        ground.material = groundMat;

        // Skybox (Simple color for now)
        this.clearColor = new Color3(0.5, 0.8, 1).toColor4();
        
        // Some obstacles/decorations
        const box = MeshBuilder.CreateBox("box", {size: 2}, this);
        box.position = new Vector3(5, 1, 5);
    }

    private createPlayer() {
        new Player(this, this.inputManager);
    }
}
