import Phaser from 'phaser';

export class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    fire(x, y, dx, dy) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);

        this.setTint(0xffaa00); // Orange enemy bullets
        this.setScale(1.5);
        this.setRotation(Math.atan2(dy, dx));

        const speed = 300;
        const mag = Math.sqrt(dx * dx + dy * dy);
        this.setVelocity((dx / mag) * speed, (dy / mag) * speed);

        this.scene.time.delayedCall(3000, () => {
            this.kill();
        });
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
    }
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'soldier') {
        super(scene, x, y, 'bullet'); // Temporary sprite
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;
        this.hp = type === 'sniper' ? 1 : 2;
        this.speed = type === 'soldier' ? -100 : 0;

        // Visuals
        this.setAlpha(0);
        this.visuals = scene.add.graphics();
        this.drawEnemy();

        this.body.setSize(32, 48);
        if (type === 'soldier') {
            this.setVelocityX(this.speed);
        }

        // Shooting logic
        this.lastFired = 0;
        this.fireRate = type === 'sniper' ? 2000 : 3000;
        this.fireTimer = scene.time.addEvent({
            delay: this.fireRate,
            callback: () => this.fire(),
            callbackScope: this,
            loop: true
        });
    }

    drawEnemy() {
        const g = this.visuals;
        g.clear();

        // Camouflage Uniform (Green/Brown)
        g.fillStyle(0x1a3300); // Dark Green base

        // Boots
        g.fillStyle(0x222222);
        g.fillRect(-10, 18, 8, 6);
        g.fillRect(2, 18, 8, 6);

        // Legs (Camo)
        g.fillStyle(0x1a3300);
        g.fillRect(-9, 6, 6, 14);
        g.fillRect(3, 6, 6, 14);

        // Camo splotches on legs
        g.fillStyle(0x331a00); // Brown
        g.fillRect(-8, 10, 3, 3);
        g.fillRect(4, 8, 3, 3);

        // Torso (Camo)
        g.fillStyle(0x1a3300);
        g.fillRect(-12, -12, 24, 20);
        g.fillStyle(0x331a00);
        g.fillRect(-10, -8, 6, 6);
        g.fillRect(6, -4, 6, 6);

        // Arms
        g.fillStyle(0xffdbac); // Skin
        g.fillRect(-16, -10, 6, 14);
        g.fillRect(10, -10, 6, 14);

        // Head (Skin + Mask/Face)
        g.fillStyle(0xffdbac);
        g.fillRect(-8, -28, 16, 16);

        // Eyes (Small red dots for aggressive look)
        g.fillStyle(0xff0000);
        g.fillRect(-4, -24, 2, 2);
        g.fillRect(2, -24, 2, 2);

        // Helmet (Dull green)
        g.fillStyle(0x2d4d1a);
        g.fillRect(-9, -30, 18, 6);

        // Gun (Dark Grey)
        g.fillStyle(0x444444);
        g.fillRect(-18, -4, 14, 4); // Barrel pointing left
    }

    update() {
        this.visuals.setPosition(this.x, this.y);
        if (this.x < -50) {
            this.destroy();
        }
    }

    fire() {
        if (!this.active || !this.scene.player || !this.scene.player.active) return;

        // Calculate direction to player
        const player = this.scene.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;

        // Soldiers fire horizontally, Snipers aim at player
        if (this.type === 'soldier') {
            this.spawnBullet(-1, 0); // Fire left
        } else {
            this.spawnBullet(dx, dy);
        }
    }

    spawnBullet(dx, dy) {
        const bullet = this.scene.enemyBullets.get(this.x - 20, this.y - 5);
        if (bullet) {
            bullet.fire(this.x - 20, this.y - 5, dx, dy);
        }
    }

    destroy(fromScene) {
        if (this.fireTimer) this.fireTimer.remove();
        if (this.visuals) this.visuals.destroy();
        super.destroy(fromScene);
    }

    takeDamage() {
        this.hp--;
        if (this.hp <= 0) {
            this.destroy();
            return true; // killed
        }
        // Flicker effect
        this.visuals.setAlpha(0.5);
        this.scene.time.delayedCall(50, () => this.visuals && this.visuals.setAlpha(1));
        return false;
    }
}

export class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.physics.add.group({
            classType: Enemy,
            runChildUpdate: true
        });

        // Add Enemy Bullets Pool
        this.scene.enemyBullets = scene.physics.add.group({
            classType: EnemyBullet,
            runChildUpdate: true
        });

        this.spawnTimer = 0;
        this.spawnDelay = 2000;
    }

    update(time) {
        if (time > this.spawnTimer) {
            this.spawnEnemy();
            this.spawnTimer = time + this.spawnDelay;
            // Balance spawn delay based on stage in MainScene if possible
        }
    }

    spawnEnemy() {
        // Spawn from right edge of camera
        const cam = this.scene.cameras.main;
        const x = cam.scrollX + 850;
        const y = 500;
        const type = Math.random() > 0.8 ? 'sniper' : 'soldier';
        const enemy = new Enemy(this.scene, x, y, type);
        this.enemies.add(enemy);
    }

    setDifficulty(delay) {
        this.spawnDelay = delay;
    }
}
