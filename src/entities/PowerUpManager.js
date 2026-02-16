import Phaser from 'phaser';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, 'bullet'); // Temporary sprite
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type; // 'S', 'L', 'M'
        this.setTint(this.getTintColor(type));
        this.setScale(2);
        this.setGravityY(200);

        // Sine wave movement
        this.baseX = x;
        this.time = 0;
    }

    getTintColor(type) {
        switch (type) {
            case 'S': return 0xff00ff; // Magenta
            case 'L': return 0x00ffff; // Cyan
            case 'M': return 0xffff00; // Yellow
            default: return 0xffffff;
        }
    }

    update(time, delta) {
        this.time += delta;
        this.x = this.baseX + Math.sin(this.time / 500) * 50;
    }
}

export class PowerUpManager {
    constructor(scene) {
        this.scene = scene;
        this.powerUps = scene.physics.add.group({
            classType: PowerUp,
            runChildUpdate: true
        });
    }

    spawnPowerUp(x, y) {
        const types = ['S', 'L', 'M'];
        const type = types[Math.floor(Math.random() * types.length)];
        const powerUp = new PowerUp(this.scene, x, y, type);
        this.powerUps.add(powerUp);
    }
}
