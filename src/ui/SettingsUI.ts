import { InputManager, GameAction } from "../core/InputManager";

export class SettingsUI {
    private inputManager: InputManager;
    private overlay: HTMLDivElement;
    private isVisible: boolean = false;

    constructor(inputManager: InputManager) {
        this.inputManager = inputManager;
        this.overlay = this.createOverlay();
        this.setupToggle();
    }

    private createOverlay(): HTMLDivElement {
        const div = document.createElement("div");
        div.id = "settings-overlay";
        div.style.position = "absolute";
        div.style.top = "50%";
        div.style.left = "50%";
        div.style.transform = "translate(-50%, -50%)";
        div.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        div.style.color = "white";
        div.style.padding = "20px";
        div.style.borderRadius = "10px";
        div.style.display = "none";
        div.style.zIndex = "1000";
        div.style.fontFamily = "Arial, sans-serif";

        const title = document.createElement("h2");
        title.innerText = "Controls Settings";
        div.appendChild(title);

        const list = document.createElement("div");
        list.id = "controls-list";
        div.appendChild(list);

        const closeBtn = document.createElement("button");
        closeBtn.innerText = "Close";
        closeBtn.style.marginTop = "20px";
        closeBtn.onclick = () => this.toggle();
        div.appendChild(closeBtn);

        document.body.appendChild(div);
        return div;
    }

    private setupToggle() {
        // Add a settings button to the main UI
        const btn = document.createElement("button");
        btn.innerText = "⚙ Settings";
        btn.style.position = "absolute";
        btn.style.top = "10px";
        btn.style.right = "10px";
        btn.style.padding = "10px";
        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);
    }

    public toggle() {
        this.isVisible = !this.isVisible;
        this.overlay.style.display = this.isVisible ? "block" : "none";
        
        if (this.isVisible) {
            this.renderControls();
        }
    }

    private renderControls() {
        const list = this.overlay.querySelector("#controls-list") as HTMLDivElement;
        list.innerHTML = ""; // Clear current list

        const actions = Object.values(GameAction);
        
        actions.forEach(action => {
            const row = document.createElement("div");
            row.style.marginBottom = "10px";
            row.style.display = "flex";
            row.style.justifyContent = "space-between";
            row.style.alignItems = "center";
            row.style.width = "300px";

            const label = document.createElement("span");
            label.innerText = action;
            row.appendChild(label);

            const bindings = this.inputManager.getBindings(action);
            const keyDisplay = document.createElement("button");
            keyDisplay.innerText = bindings.join(", ");
            keyDisplay.onclick = () => this.rebind(action, keyDisplay);
            row.appendChild(keyDisplay);

            list.appendChild(row);
        });
    }

    private rebind(action: GameAction, button: HTMLButtonElement) {
        button.innerText = "Press any key...";
        
        const handler = (evt: KeyboardEvent) => {
            evt.preventDefault();
            evt.stopPropagation();
            
            this.inputManager.setBinding(action, evt.key);
            
            // Remove listener
            window.removeEventListener("keydown", handler);
            
            // Refresh UI
            this.renderControls();
        };

        window.addEventListener("keydown", handler, { once: true });
    }
}
