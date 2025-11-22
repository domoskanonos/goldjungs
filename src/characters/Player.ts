import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, ArcRotateCamera, KeyboardEventTypes } from "@babylonjs/core";

export class Player {
    public mesh;
    private scene: Scene;
    private inputMap: any = {};
    private camera: ArcRotateCamera;

    constructor(scene: Scene) {
        this.scene = scene;
        
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

        // Setup Input
        this.setupInput();

        // Register Update Loop
        this.scene.onBeforeRenderObservable.add(() => {
            this.update();
        });
    }

    private setupInput() {
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    this.inputMap[kbInfo.event.key] = true;
                    break;
                case KeyboardEventTypes.KEYUP:
                    this.inputMap[kbInfo.event.key] = false;
                    break;
            }
        });
    }

    private update() {
        const speed = 0.1;
        const moveVector = Vector3.Zero();

        if (this.inputMap["w"] || this.inputMap["W"] || this.inputMap["ArrowUp"]) {
            moveVector.z = 1;
        }
        if (this.inputMap["s"] || this.inputMap["S"] || this.inputMap["ArrowDown"]) {
            moveVector.z = -1;
        }
        if (this.inputMap["a"] || this.inputMap["A"] || this.inputMap["ArrowLeft"]) {
            moveVector.x = -1;
        }
        if (this.inputMap["d"] || this.inputMap["D"] || this.inputMap["ArrowRight"]) {
            moveVector.x = 1;
        }

        if (moveVector.length() > 0) {
            moveVector.normalize().scaleInPlace(speed);
            
            // Rotate player to face direction (optional, simple version)
            // this.mesh.lookAt(this.mesh.position.add(moveVector));

            // Move relative to camera view would be better, but world space for now
            // Simple world space movement:
            this.mesh.moveWithCollisions(moveVector);
            
            // Keep player on ground (simple gravity)
            // this.mesh.position.y = 1; 
        }
    }
}
