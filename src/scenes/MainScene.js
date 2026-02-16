import Phaser from 'phaser';
import { Player, Bullet } from '../entities/Player';
import { EnemyManager } from '../entities/EnemyManager';
import { PowerUpManager } from '../entities/PowerUpManager';

export class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    init(data) {
        this.playerName = data.playerName || 'RECRUIT';
        this.initialWeapon = data.weaponType || 'NORMAL';
        this.stage = 1;
        this.totalScore = 0;
        this.lives = 3;
    }

    create() {
        // Parallax Background
        this.createParallaxBackground();

        // Extended Ground
        this.platforms = this.physics.add.staticGroup();
        for (let x = 0; x < 2000; x += 400) {
            this.platforms.create(x, 580, 'ground').setScale(2, 1).refreshBody();
        }

        // Bullet group
        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 100,
            runChildUpdate: true
        });

        // Player
        this.player = new Player(this, 100, 450, this.playerName, this.initialWeapon);
        this.physics.add.collider(this.player, this.platforms);

        // Enemy Manager
        this.enemyManager = new EnemyManager(this);
        this.physics.add.collider(this.enemyManager.enemies, this.platforms);

        // PowerUp Manager
        this.powerUpManager = new PowerUpManager(this);
        this.physics.add.collider(this.powerUpManager.powerUps, this.platforms);

        // Boss
        this.createBoss();

        // Collisions
        this.physics.add.overlap(this.bullets, this.enemyManager.enemies, this.handleBulletEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.enemyManager.enemies, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.powerUpManager.powerUps, this.handlePlayerPowerUpCollision, null, this);
        this.physics.add.overlap(this.bullets, this.bossParts, this.handleBulletBossCollision, null, this);

        // Player vs Enemy Bullets
        if (this.enemyBullets) {
            this.physics.add.overlap(this.player, this.enemyBullets, this.handlePlayerBulletCollision, null, this);
        }

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,SHIFT');

        // HUD
        this.setupHUD();

        // Camera
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        this.cameras.main.setBounds(0, 0, 2000, 600);
        this.physics.world.setBounds(0, 0, 2000, 600);
    }

    handlePlayerBulletCollision(player, bullet) {
        if (bullet.active) {
            this.createImpactSparks(bullet.x, bullet.y);
            bullet.kill();
            this.handlePlayerDeath(player);
        }
    }

    handlePlayerDeath(player) {
        if (player.isDead) return;
        player.isDead = true;

        this.cameras.main.shake(300, 0.04);
        this.lives--;
        this.livesText.setText(`LIVES: ${this.lives}`);

        // Lose Power-up
        player.updateWeaponConfig('NORMAL');
        this.weaponHUDText.setText(`WEAPON: NORMAL`);

        // Death Visuals (Flicker/Tint)
        player.setTint(0xff0000);
        player.setVelocity(0, -400); // Hop up
        player.body.checkCollision.none = true;

        if (this.lives > 0) {
            this.time.delayedCall(1000, () => this.respawnPlayer(player));
        } else {
            this.time.delayedCall(1000, () => this.gameOver());
        }
    }

    respawnPlayer(player) {
        player.isDead = false;
        player.clearTint();
        player.body.checkCollision.none = false;

        // Find safe spot (simplified: just revert to start or keep current X with safe Y)
        // Ideally we'd find a checkpoint, but for now let's drop them from the sky near current X
        const safeX = Math.max(100, this.cameras.main.scrollX + 100);
        player.setPosition(safeX, 200);
        player.setVelocity(0, 0);

        // Temporary Invulnerability
        player.setAlpha(0.5);
        this.tweens.add({
            targets: player,
            alpha: 1,
            duration: 200,
            repeat: 10,
            onComplete: () => {
                player.setAlpha(1);
            }
        });
    }

    gameOver() {
        this.add.text(this.cameras.main.scrollX + 400, 300, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            this.scene.restart({ playerName: this.playerName });
        });
    }

    createBoss() {
        this.bossParts = this.physics.add.staticGroup();

        // Jungle Bunker (Camouflage Green/Brown)
        const wall = this.add.rectangle(1950, 300, 100, 600, 0x1a3300);
        this.physics.add.existing(wall, true);

        // Camo splotches on bunker
        for (let i = 0; i < 20; i++) {
            this.add.rectangle(1920 + Math.random() * 30, Math.random() * 600, 20, 20, 0x331a00).setAlpha(0.6);
        }

        // Turrets (Camouflaged)
        for (let i = 0; i < 3; i++) {
            const y = 150 + i * 150;
            const turret = this.add.rectangle(1900, y, 40, 40, 0x2d4d1a);
            turret.setStrokeStyle(4, 0x00ff00);
            this.bossParts.add(turret);
            turret.hp = 20 + (this.stage * 10);
            turret.isAlive = true;

            // Cannon
            this.add.rectangle(1880, y, 20, 10, 0x111111);

            // Vines over turret
            this.add.text(1870, y - 20, '~~~~', { fontSize: '20px', fill: '#006400' }).setAlpha(0.5);
        }

        this.bossAliveCount = 3;
    }

    createParallaxBackground() {
        // Deep Forest Sky
        this.add.rectangle(1000, 300, 2000, 600, 0x011a01).setScrollFactor(0);

        // Distant Trees (Dark Green)
        for (let i = 0; i < 30; i++) {
            const x = i * 100 + Math.random() * 50;
            const h = 300 + Math.random() * 200;
            const tree = this.add.graphics({ x: x });
            tree.fillStyle(0x0a240a);
            tree.fillRect(-20, 600 - h, 40, h); // Trunk
            tree.fillStyle(0x051a05);
            tree.fillCircle(0, 600 - h, 60); // Leaves
            tree.setScrollFactor(0.2);
        }

        // Mid-ground Forest (Green)
        for (let i = 0; i < 20; i++) {
            const x = i * 150 + Math.random() * 100;
            const h = 200 + Math.random() * 150;
            const tree = this.add.graphics({ x: x });
            tree.fillStyle(0x1a3300);
            tree.fillRect(-15, 600 - h, 30, h);
            tree.fillStyle(0x2d4d1a);
            tree.fillTriangle(-50, 600 - h, 50, 600 - h, 0, 600 - h - 100);
            tree.setScrollFactor(0.5);
        }
    }

    setupHUD() {
        this.scoreText = this.add.text(16, 16, `${this.playerName}: 000000`, {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setScrollFactor(0);

        this.stageText = this.add.text(16, 50, `STAGE: ${this.stage}`, {
            fontSize: '18px',
            fill: '#ff0',
            fontFamily: 'Courier New'
        }).setScrollFactor(0);

        this.weaponHUDText = this.add.text(16, 75, `WEAPON: ${this.player.weaponType}`, {
            fontSize: '18px',
            fill: '#0f0',
            fontFamily: 'Courier New'
        }).setScrollFactor(0);

        this.livesText = this.add.text(16, 100, `LIVES: ${this.lives}`, {
            fontSize: '18px',
            fill: '#f00',
            fontFamily: 'Courier New'
        }).setScrollFactor(0);
    }

    update(time, delta) {
        if (this.player) {
            this.player.update(this.cursors, this.keys, time);
            this.weaponHUDText.setText(`WEAPON: ${this.player.weaponType}`);
        }
        if (this.enemyManager) {
            this.enemyManager.update(time);
        }
    }

    handleBulletEnemyCollision(bullet, enemy) {
        if (bullet.active && enemy.active) {
            this.createImpactSparks(bullet.x, bullet.y);
            bullet.kill();
            if (enemy.takeDamage()) {
                this.totalScore += 100;
                this.updateScore();
            }
        }
    }

    handleBulletBossCollision(bullet, turret) {
        if (bullet.active && turret.isAlive) {
            this.createImpactSparks(bullet.x, bullet.y);
            bullet.kill();
            turret.hp--;
            turret.setFillStyle(0xffffff); // Flicker
            this.time.delayedCall(50, () => turret.setFillStyle(0x888888));

            if (turret.hp <= 0) {
                turret.isAlive = false;
                turret.setVisible(false);
                turret.active = false;
                turret.body.enable = false;
                this.bossAliveCount--;
                this.totalScore += 1000;
                this.updateScore();

                if (this.bossAliveCount <= 0) {
                    this.clearStage();
                }
            }
        }
    }

    updateScore() {
        this.scoreText.setText(`${this.playerName}: ${this.totalScore.toString().padStart(6, '0')}`);
    }

    clearStage() {
        const text = this.add.text(1000, 300, `STAGE ${this.stage} CLEAR!`, {
            fontSize: '64px',
            fill: '#ff0',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            this.stage++;
            this.scene.restart({ playerName: this.playerName, weaponType: this.player.weaponType });
        });
    }

    handlePlayerEnemyCollision(player, enemy) {
        if (enemy.active && !player.isDead) {
            this.handlePlayerDeath(player);
        }
    }

    handlePlayerPowerUpCollision(player, powerUp) {
        player.applyPowerUp(powerUp.type);
        powerUp.destroy();
    }

    createImpactSparks(x, y) {
        for (let i = 0; i < 5; i++) {
            const spark = this.add.rectangle(x, y, 4, 4, 0xffff00);
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            this.physics.add.existing(spark);
            spark.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

            this.tweens.add({
                targets: spark,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => spark.destroy()
            });
        }
    }
}
