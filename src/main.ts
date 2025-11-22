import './style.css'
import { Game } from './app.ts'

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    if (!canvas) {
        throw new Error("Canvas not found");
    }
    
    const game = new Game(canvas);
    game.start();
});
