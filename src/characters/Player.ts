import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, ArcRotateCamera } from "@babylonjs/core";
import { InputManager, GameAction } from "../core/InputManager";

export class Player {
    public mesh;
    private scene: Scene;
    private inputManager: InputManager;
    private camera: ArcRotateCamera;

    constructor(scene: Scene, inputManager: InputManager) {
        this.scene = scene;
        this.inputManager = inputManager;
        
        // Create Player Mesh (Simple Capsule for now)
        this.mesh = MeshBuilder.CreateCapsule("player", {height: 2, radius: 0.5}, scene);
        this.mesh.position.y = 1;
        this.mesh.checkCollisions = true;
        this.mesh.ellipsoid = new Vector3(0.5, 1, 0.5);
        
        const material = new StandardMaterial("playerMat", scene);
        material.diffuseColor = new Color3(0, 0, 1); // Blue for Leonas?
        this.mesh.material = material;

        // Setup Camera
        this.camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 3, 10, this.mesh.position, scene);
        this.camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
        this.camera.lowerRadiusLimit = 5;
        this.camera.upperRadiusLimit = 20;
        
        // Lock camera target to player
        this.camera.lockedTarget = this.mesh;

        // Register Update Loop
        this.scene.onBeforeRenderObservable.add(() => {
            this.update();
        });
    }

    private update() {
        const speed = 0.1;
        const moveVector = Vector3.Zero();

        if (this.inputManager.isActionActive(GameAction.MOVE_FORWARD)) {
            moveVector.z = 1;
        }
        if (this.inputManager.isActionActive(GameAction.MOVE_BACKWARD)) {
            moveVector.z = -1;
        }
        if (this.inputManager.isActionActive(GameAction.MOVE_LEFT)) {
            moveVector.x = -1;
        }
        if (this.inputManager.isActionActive(GameAction.MOVE_RIGHT)) {
            moveVector.x = 1;
        }

        if (moveVector.length() > 0) {
            moveVector.normalize().scaleInPlace(speed);
            
            // Rotate player to face direction (optional, simple version)
            // this.mesh.lookAt(this.mesh.position.add(moveVector));

            // Move relative to camera view would be better, but world space for now
            // Simple world space movement:
            this.mesh.moveWithCollisions(moveVector);
        }
    }
}
