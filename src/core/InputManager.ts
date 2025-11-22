import { Scene, ActionManager } from "@babylonjs/core";

export enum GameAction {
    MOVE_FORWARD = "MOVE_FORWARD",
    MOVE_BACKWARD = "MOVE_BACKWARD",
    MOVE_LEFT = "MOVE_LEFT",
    MOVE_RIGHT = "MOVE_RIGHT",
    JUMP = "JUMP",
    LOOK_UP = "LOOK_UP",
    LOOK_DOWN = "LOOK_DOWN",
    LOOK_LEFT = "LOOK_LEFT",
    LOOK_RIGHT = "LOOK_RIGHT"
}

export class InputManager {
    private scene: Scene;
    private inputMap: { [key: string]: boolean } = {};
    private bindings: { [action in GameAction]: string[] };

    constructor(scene: Scene) {
        this.scene = scene;
        
        // Default Bindings
        this.bindings = {
            [GameAction.MOVE_FORWARD]: ["w", "ArrowUp"],
            [GameAction.MOVE_BACKWARD]: ["s", "ArrowDown"],
            [GameAction.MOVE_LEFT]: ["a", "ArrowLeft"],
            [GameAction.MOVE_RIGHT]: ["d", "ArrowRight"],
            [GameAction.JUMP]: [" "],
            [GameAction.LOOK_UP]: ["i"],
            [GameAction.LOOK_DOWN]: ["k"],
            [GameAction.LOOK_LEFT]: ["j"],
            [GameAction.LOOK_RIGHT]: ["l"]
        };

        this.setupInput();
    }

    private setupInput() {
        this.scene.actionManager = new ActionManager(this.scene);

        // We use the window event listener for broader support (including UI interactions later)
        // but keeping it attached to scene logic is good practice.
        // Let's use window for raw key state to be safe.
        
        window.addEventListener("keydown", (evt) => {
            this.inputMap[evt.key] = true;
            this.inputMap[evt.key.toLowerCase()] = true; // Handle caps lock/shift
        });

        window.addEventListener("keyup", (evt) => {
            this.inputMap[evt.key] = false;
            this.inputMap[evt.key.toLowerCase()] = false;
        });
    }

    public isActionActive(action: GameAction): boolean {
        const keys = this.bindings[action];
        for (const key of keys) {
            if (this.inputMap[key]) {
                return true;
            }
        }
        return false;
    }

    public getBindings(action: GameAction): string[] {
        return this.bindings[action];
    }

    public setBinding(action: GameAction, key: string) {
        // Simple replacement for now: Clear old, set new.
        // Or maybe just add it? Let's replace the first key (primary) and keep arrows?
        // For simplicity in this iteration: Replace ALL bindings for this action with just this new key.
        this.bindings[action] = [key];
    }
}
