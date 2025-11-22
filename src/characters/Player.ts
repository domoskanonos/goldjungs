import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, ArcRotateCamera, Ray } from "@babylonjs/core";
import { InputManager, GameAction } from "../core/InputManager";

export class Player {
    public mesh;
    private scene: Scene;
    private inputManager: InputManager;
    private camera: ArcRotateCamera;

    private verticalVelocity: number = 0;
    private readonly GRAVITY: number = -0.015;
    private readonly JUMP_FORCE: number = 0.5;

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

        // Movement
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

        // Camera Look
        const cameraSpeed = 0.05;
        if (this.inputManager.isActionActive(GameAction.LOOK_LEFT)) {
            this.camera.alpha += cameraSpeed;
        }
        if (this.inputManager.isActionActive(GameAction.LOOK_RIGHT)) {
            this.camera.alpha -= cameraSpeed;
        }
        if (this.inputManager.isActionActive(GameAction.LOOK_UP)) {
            this.camera.beta -= cameraSpeed;
        }
        if (this.inputManager.isActionActive(GameAction.LOOK_DOWN)) {
            this.camera.beta += cameraSpeed;
        }

        // Apply Movement
        if (moveVector.length() > 0) {
            moveVector.normalize().scaleInPlace(speed);
            this.mesh.moveWithCollisions(moveVector);
        }

        // Jumping & Gravity
        const ray = new Ray(this.mesh.position, Vector3.Down(), 1.1);
        const pick = this.scene.pickWithRay(ray, (mesh) => mesh.isPickable && mesh !== this.mesh);
        const isGrounded = pick?.hit;

        if (isGrounded) {
            this.verticalVelocity = 0;
            if (this.inputManager.isActionActive(GameAction.JUMP)) {
                this.verticalVelocity = this.JUMP_FORCE;
            }
        } else {
            this.verticalVelocity += this.GRAVITY;
        }
        
        this.mesh.moveWithCollisions(new Vector3(0, this.verticalVelocity, 0));
    }
}
