import { Scene, Engine, Vector3, HemisphericLight, MeshBuilder, StandardMaterial, Color3, ArcRotateCamera } from "@babylonjs/core";
import { PathSystem } from "../systems/PathSystem";
import { WaveManager } from "../systems/WaveManager";
import { TowerPlacementSystem } from "../systems/TowerPlacementSystem";
import { GameManager, GameState } from "../systems/GameManager";
import { TowerDefenseUI } from "../ui/TowerDefenseUI";

export class TowerDefenseScene extends Scene {
    private pathSystem: PathSystem;
    private waveManager: WaveManager;
    private placementSystem: TowerPlacementSystem;
    private gameManager: GameManager;

    constructor(engine: Engine) {
        super(engine);
        
        this.gameManager = GameManager.getInstance();
        this.gameManager.reset();
        
        this.setupCamera();
        this.createEnvironment();
        this.setupPath();
        
        this.pathSystem = new PathSystem(this.createPathWaypoints());
        this.waveManager = new WaveManager(this, this.pathSystem);
        this.placementSystem = new TowerPlacementSystem(this);
        
        // Initialize UI
        new TowerDefenseUI(
            this.waveManager,
            this.placementSystem,
            this.gameManager
        );
        
        this.setupGameLoop();
        
        // Start in menu state
        this.gameManager.setGameState(GameState.PLAYING);
    }

    private setupCamera(): void {
        // Top-down camera view
        const camera = new ArcRotateCamera(
            "camera",
            -Math.PI / 2,
            Math.PI / 4,
            40,
            new Vector3(0, 0, 0),
            this
        );
        camera.attachControl(this.getEngine().getRenderingCanvas(), true);
        camera.lowerRadiusLimit = 20;
        camera.upperRadiusLimit = 60;
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = Math.PI / 2.5;
    }

    private createEnvironment(): void {
        // Light
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this);
        light.intensity = 0.8;

        // Ground
        const ground = MeshBuilder.CreateGround(
            "ground",
            { width: 40, height: 40 },
            this
        );
        const groundMat = new StandardMaterial("groundMat", this);
        groundMat.diffuseColor = new Color3(0.3, 0.5, 0.3); // Green grass
        ground.material = groundMat;

        // Skybox
        this.clearColor = new Color3(0.5, 0.7, 0.9).toColor4();
    }

    private createPathWaypoints(): Vector3[] {
        // Create a winding path from left to right
        return [
            new Vector3(-15, 0, -10),
            new Vector3(-10, 0, -10),
            new Vector3(-10, 0, -5),
            new Vector3(-5, 0, -5),
            new Vector3(-5, 0, 0),
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 5),
            new Vector3(5, 0, 5),
            new Vector3(5, 0, 10),
            new Vector3(10, 0, 10),
            new Vector3(15, 0, 10)
        ];
    }

    private setupPath(): void {
        // Visualize the path
        const waypoints = this.createPathWaypoints();
        
        for (let i = 0; i < waypoints.length - 1; i++) {
            const start = waypoints[i];
            const end = waypoints[i + 1];
            
            const direction = end.subtract(start);
            const distance = direction.length();
            const center = start.add(direction.scale(0.5));
            
            const pathSegment = MeshBuilder.CreateBox(
                `pathSegment_${i}`,
                { width: 2, height: 0.1, depth: distance },
                this
            );
            pathSegment.position = center;
            pathSegment.lookAt(end);
            
            const material = new StandardMaterial(`pathMat_${i}`, this);
            material.diffuseColor = new Color3(0.6, 0.4, 0.2); // Brown path
            material.emissiveColor = new Color3(0.2, 0.1, 0.05);
            pathSegment.material = material;
        }

        // Mark start and end
        const startMarker = MeshBuilder.CreateCylinder(
            "startMarker",
            { height: 1, diameter: 2 },
            this
        );
        startMarker.position = waypoints[0];
        const startMat = new StandardMaterial("startMat", this);
        startMat.diffuseColor = new Color3(1, 0, 0);
        startMat.emissiveColor = new Color3(0.5, 0, 0);
        startMarker.material = startMat;

        const endMarker = MeshBuilder.CreateCylinder(
            "endMarker",
            { height: 1, diameter: 2 },
            this
        );
        endMarker.position = waypoints[waypoints.length - 1];
        const endMat = new StandardMaterial("endMat", this);
        endMat.diffuseColor = new Color3(0, 0, 1);
        endMat.emissiveColor = new Color3(0, 0, 0.5);
        endMarker.material = endMat;
    }

    private setupGameLoop(): void {
        this.onBeforeRenderObservable.add(() => {
            // Update towers with current enemies
            const enemies = this.waveManager.getCurrentWaveEnemies();
            const towers = this.placementSystem.getTowers();
            
            for (const tower of towers) {
                tower.setEnemies(enemies);
            }
        });
    }
}
