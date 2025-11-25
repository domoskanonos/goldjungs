export enum GameState {
    MENU = "MENU",
    PLAYING = "PLAYING",
    PAUSED = "PAUSED",
    GAME_OVER = "GAME_OVER",
    VICTORY = "VICTORY"
}

export class GameManager {
    private static instance: GameManager;
    
    private gold: number = 200; // Starting gold
    private lives: number = 20; // Starting lives
    private score: number = 0;
    private currentWave: number = 0;
    private gameState: GameState = GameState.MENU;
    
    private onGoldChangedCallbacks: ((gold: number) => void)[] = [];
    private onLivesChangedCallbacks: ((lives: number) => void)[] = [];
    private onScoreChangedCallbacks: ((score: number) => void)[] = [];
    private onWaveChangedCallbacks: ((wave: number) => void)[] = [];
    private onGameStateChangedCallbacks: ((state: GameState) => void)[] = [];

    private constructor() {}

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    public reset(): void {
        this.gold = 200;
        this.lives = 20;
        this.score = 0;
        this.currentWave = 0;
        this.gameState = GameState.MENU;
        this.notifyAllCallbacks();
    }

    // Gold Management
    public getGold(): number {
        return this.gold;
    }

    public addGold(amount: number): void {
        this.gold += amount;
        this.onGoldChangedCallbacks.forEach(cb => cb(this.gold));
    }

    public spendGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.onGoldChangedCallbacks.forEach(cb => cb(this.gold));
            return true;
        }
        return false;
    }

    public onGoldChanged(callback: (gold: number) => void): void {
        this.onGoldChangedCallbacks.push(callback);
    }

    // Lives Management
    public getLives(): number {
        return this.lives;
    }

    public loseLife(amount: number = 1): void {
        this.lives -= amount;
        this.onLivesChangedCallbacks.forEach(cb => cb(this.lives));
        
        if (this.lives <= 0) {
            this.lives = 0;
            this.setGameState(GameState.GAME_OVER);
        }
    }

    public onLivesChanged(callback: (lives: number) => void): void {
        this.onLivesChangedCallbacks.push(callback);
    }

    // Score Management
    public getScore(): number {
        return this.score;
    }

    public addScore(amount: number): void {
        this.score += amount;
        this.onScoreChangedCallbacks.forEach(cb => cb(this.score));
    }

    public onScoreChanged(callback: (score: number) => void): void {
        this.onScoreChangedCallbacks.push(callback);
    }

    // Wave Management
    public getCurrentWave(): number {
        return this.currentWave;
    }

    public nextWave(): void {
        this.currentWave++;
        this.onWaveChangedCallbacks.forEach(cb => cb(this.currentWave));
    }

    public onWaveChanged(callback: (wave: number) => void): void {
        this.onWaveChangedCallbacks.push(callback);
    }

    // Game State Management
    public getGameState(): GameState {
        return this.gameState;
    }

    public setGameState(state: GameState): void {
        this.gameState = state;
        this.onGameStateChangedCallbacks.forEach(cb => cb(state));
    }

    public onGameStateChanged(callback: (state: GameState) => void): void {
        this.onGameStateChangedCallbacks.push(callback);
    }

    private notifyAllCallbacks(): void {
        this.onGoldChangedCallbacks.forEach(cb => cb(this.gold));
        this.onLivesChangedCallbacks.forEach(cb => cb(this.lives));
        this.onScoreChangedCallbacks.forEach(cb => cb(this.score));
        this.onWaveChangedCallbacks.forEach(cb => cb(this.currentWave));
        this.onGameStateChangedCallbacks.forEach(cb => cb(this.gameState));
    }
}
