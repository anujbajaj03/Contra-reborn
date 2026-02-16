import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';
import { WelcomeScene } from './scenes/WelcomeScene';
import { MainScene } from './scenes/MainScene';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'app',
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: [Preloader, WelcomeScene, MainScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true
};

new Phaser.Game(config);
