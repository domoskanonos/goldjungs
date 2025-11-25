import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, Mesh } from "@babylonjs/core";
import { Tower } from "../entities/Tower";
import { NicoTower } from "../entities/towers/NicoTower";
import { LarsTower } from "../entities/towers/LarsTower";
import { PaulinaTower } from "../entities/towers/PaulinaTower";
import { TomTower } from "../entities/towers/TomTower";
import { GameManager } from "./GameManager";

export class TowerPlacementSystem {
    private scene: Scene;
    private gameManager: GameManager;
    private towers: Tower[] = [];
    private placementGrid: boolean[][] = []; // true = occupied, false = available
    private gridSize: number = 20;
    private cellSize: number = 2;
    private ghostTower: Mesh | null = null;
    private selectedTowerType: typeof Tower | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.gameManager = GameManager.getInstance();
        
        // Initialize grid (all cells available initially)
        for (let x = 0; x < this.gridSize; x++) {
            this.placementGrid[x] = [];
            for (let z = 0; z < this.gridSize; z++) {
                this.placementGrid[x][z] = false;
            }
        }

        this.setupMouseInteraction();
    }

    private setupMouseInteraction(): void {
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === 1) { // POINTERDOWN
                const pickResult = this.scene.pick(
                    this.scene.pointerX,
                    this.scene.pointerY
                );

                if (pickResult?.hit && pickResult.pickedPoint) {
                    this.handleClick(pickResult.pickedPoint);
                }
            } else if (pointerInfo.type === 4) { // POINTERMOVE
                const pickResult = this.scene.pick(
                    this.scene.pointerX,
                    this.scene.pointerY
                );

                if (pickResult?.hit && pickResult.pickedPoint) {
                    this.updateGhostTower(pickResult.pickedPoint);
                }
            }
        });
    }

    private handleClick(position: Vector3): void {
        if (!this.selectedTowerType) return;

        const gridPos = this.worldToGrid(position);
        
        if (!this.isValidPlacement(gridPos.x, gridPos.z)) {
            console.log("Invalid placement location");
            return;
        }

        // Get tower cost
        const tempTower = this.createTowerInstance(
            this.selectedTowerType,
            new Vector3(0, 0, 0)
        );
        const cost = tempTower.getCost();
        tempTower.dispose();

        // Check if player has enough gold
        if (!this.gameManager.spendGold(cost)) {
            console.log("Not enough gold");
            return;
        }

        // Place tower
        const worldPos = this.gridToWorld(gridPos.x, gridPos.z);
        const tower = this.createTowerInstance(this.selectedTowerType, worldPos);
        this.towers.push(tower);
        this.placementGrid[gridPos.x][gridPos.z] = true;

        console.log(`Placed ${tower.type} tower at (${gridPos.x}, ${gridPos.z})`);
    }

    private createTowerInstance(towerClass: typeof Tower, position: Vector3): Tower {
        if (towerClass === NicoTower) {
            return new NicoTower(this.scene, position);
        } else if (towerClass === LarsTower) {
            return new LarsTower(this.scene, position);
        } else if (towerClass === PaulinaTower) {
            return new PaulinaTower(this.scene, position);
        } else if (towerClass === TomTower) {
            return new TomTower(this.scene, position);
        }
        throw new Error("Unknown tower type");
    }

    private updateGhostTower(position: Vector3): void {
        if (!this.selectedTowerType) {
            if (this.ghostTower) {
                this.ghostTower.dispose();
                this.ghostTower = null;
            }
            return;
        }

        const gridPos = this.worldToGrid(position);
        const worldPos = this.gridToWorld(gridPos.x, gridPos.z);
        const isValid = this.isValidPlacement(gridPos.x, gridPos.z);

        if (!this.ghostTower) {
            this.ghostTower = MeshBuilder.CreateCylinder(
                "ghostTower",
                { height: 2, diameter: 1 },
                this.scene
            );
            const material = new StandardMaterial("ghostMat", this.scene);
            material.alpha = 0.5;
            this.ghostTower.material = material;
        }

        this.ghostTower.position = worldPos;
        
        const material = this.ghostTower.material as StandardMaterial;
        material.diffuseColor = isValid ? new Color3(0, 1, 0) : new Color3(1, 0, 0);
    }

    private worldToGrid(position: Vector3): { x: number; z: number } {
        const x = Math.floor((position.x + this.gridSize * this.cellSize / 2) / this.cellSize);
        const z = Math.floor((position.z + this.gridSize * this.cellSize / 2) / this.cellSize);
        return { x, z };
    }

    private gridToWorld(gridX: number, gridZ: number): Vector3 {
        const x = gridX * this.cellSize - this.gridSize * this.cellSize / 2 + this.cellSize / 2;
        const z = gridZ * this.cellSize - this.gridSize * this.cellSize / 2 + this.cellSize / 2;
        return new Vector3(x, 1, z);
    }

    private isValidPlacement(gridX: number, gridZ: number): boolean {
        // Check bounds
        if (gridX < 0 || gridX >= this.gridSize || gridZ < 0 || gridZ >= this.gridSize) {
            return false;
        }

        // Check if already occupied
        if (this.placementGrid[gridX][gridZ]) {
            return false;
        }

        // TODO: Add path blocking check

        return true;
    }

    public setSelectedTowerType(towerClass: typeof Tower | null): void {
        this.selectedTowerType = towerClass;
    }

    public getTowers(): Tower[] {
        return this.towers;
    }

    public blockGridCell(gridX: number, gridZ: number): void {
        if (gridX >= 0 && gridX < this.gridSize && gridZ >= 0 && gridZ < this.gridSize) {
            this.placementGrid[gridX][gridZ] = true;
        }
    }
}
