import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name = 'RECRUIT', weaponType = 'NORMAL') {
        super(scene, x, y, 'bullet'); // Use a placeholder texture
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.playerName = name;
        this.weaponType = weaponType;

        // Hide the original placeholder sprite texture
        this.setAlpha(0);

        // Visuals using Graphics
        this.visuals = scene.add.graphics();
        this.drawPlayer();

        this.setScale(1); // Reset scale, we'll draw at correct size
        this.body.setSize(32, 48);
        this.setCollideWorldBounds(true);
        this.setGravityY(600);

        this.speed = 200;
        this.jumpForce = -450;
        this.isDashing = false;
        this.canDoubleJump = true;

        this.lastFired = 0;
        this.fireRate = 200;

        // Weapon config
        this.updateWeaponConfig(weaponType);

        this.shootDirection = { x: 1, y: 0 };
    }

    drawPlayer() {
        const g = this.visuals;
        g.clear();

        const flip = this.flipX ? -1 : 1;

        // Boots (Black/Brown)
        g.fillStyle(0x331a00);
        g.fillRect(-10 * flip, 18, 8 * flip, 6); // Left boot
        g.fillRect(2 * flip, 18, 8 * flip, 6);  // Right boot

        // Legs (Blue pants)
        g.fillStyle(0x0000ff);
        g.fillRect(-9 * flip, 6, 6 * flip, 14); // Left leg
        g.fillRect(3 * flip, 6, 6 * flip, 14);  // Right leg

        // Belt (Brown)
        g.fillStyle(0x663300);
        g.fillRect(-12 * flip, 4, 24 * flip, 4);

        // Torso (Skin/Tan)
        g.fillStyle(0xffdbac);
        g.fillRect(-12 * flip, -12, 24 * flip, 16);

        // Arms
        g.fillRect(-16 * flip, -10, 6 * flip, 14);
        g.fillRect(10 * flip, -10, 6 * flip, 14);

        // Head (Skin)
        g.fillRect(-8 * flip, -28, 16 * flip, 16);

        // Eyes (Small blue dots)
        g.fillStyle(0x0000ff);
        g.fillRect(2 * flip, -24, 2 * flip, 2);
        g.fillRect(5 * flip, -24, 2 * flip, 2);

        // Hair/Hat (Brown hair + Red Headband)
        g.fillStyle(0x4d2600); // Hair
        g.fillRect(-8 * flip, -30, 16 * flip, 4);

        g.fillStyle(0xff0000); // Headband
        g.fillRect(-9 * flip, -22, 18 * flip, 4);

        // Gun (Dark Steel)
        g.fillStyle(0x333333);
        g.fillRect(8 * flip, -2, 22 * flip, 6); // Barrel
        g.fillRect(6 * flip, 2, 6 * flip, 8);   // Grip
    }

    updateWeaponConfig(type) {
        this.weaponType = type;
        switch (type) {
            case 'SPREAD':
                this.fireRate = 400;
                break;
            case 'LASER':
                this.fireRate = 100;
                break;
            default:
                this.fireRate = 200;
        }
    }

    update(cursors, keys, time) {
        if (this.isDashing) return;

        this.setVelocityX(0);

        const left = keys.A.isDown || cursors.left.isDown;
        const right = keys.D.isDown || cursors.right.isDown;

        if (left) {
            this.setVelocityX(-this.speed);
            this.setFlipX(true);
        } else if (right) {
            this.setVelocityX(this.speed);
            this.setFlipX(false);
        }

        const didPressJump = Phaser.Input.Keyboard.JustDown(keys.W) ||
            Phaser.Input.Keyboard.JustDown(cursors.up) ||
            Phaser.Input.Keyboard.JustDown(keys.SPACE);

        if (didPressJump) {
            if (this.body.touching.down) {
                this.setVelocityY(this.jumpForce);
                this.canDoubleJump = true;
            } else if (this.canDoubleJump) {
                this.setVelocityY(this.jumpForce * 0.8);
                this.canDoubleJump = false;
            }
        }

        // Update visuals position
        this.visuals.setPosition(this.x, this.y);
        this.drawPlayer();

        this.updateShootDirection(cursors, keys);

        // Space to fire
        if (keys.SPACE.isDown || cursors.space?.isDown) {
            this.fire(time);
        }
    }

    updateShootDirection(cursors, keys) {
        let dx = 0;
        let dy = 0;

        if (cursors.left.isDown || keys.A.isDown) dx = -1;
        else if (cursors.right.isDown || keys.D.isDown) dx = 1;

        if (cursors.up.isDown || keys.W.isDown) dy = -1;
        else if (cursors.down.isDown || keys.S.isDown) dy = 1;

        if (dx === 0 && dy === 0) {
            dx = this.flipX ? -1 : 1;
            dy = 0;
        }

        this.shootDirection = { x: dx, y: dy };
    }

    fire(time) {
        if (time < this.lastFired + this.fireRate) return;
        this.lastFired = time;

        const { x, y } = this;
        const { x: dx, y: dy } = this.shootDirection;

        if (this.weaponType === 'SPREAD') {
            for (let i = -2; i <= 2; i++) {
                const angle = Math.atan2(dy, dx) + (i * 0.2);
                this.spawnBullet(x, y, Math.cos(angle), Math.sin(angle));
            }
        } else if (this.weaponType === 'LASER') {
            this.spawnBullet(x, y, dx, dy, true);
        } else {
            this.spawnBullet(x, y, dx, dy);
        }
    }

    spawnBullet(x, y, dx, dy, isLaser = false) {
        const bullet = this.scene.bullets.get(x, y);
        if (bullet) {
            bullet.fire(x, y, dx, dy, isLaser);
        }
    }

    applyPowerUp(type) {
        this.updateWeaponConfig(type === 'S' ? 'SPREAD' : type === 'L' ? 'LASER' : 'NORMAL');
        // Visual feedback
        this.visuals.setAlpha(0.5);
        this.scene.time.delayedCall(100, () => this.visuals.setAlpha(1));
    }
}

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    fire(x, y, dx, dy, isLaser = false) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);

        const speed = isLaser ? 800 : 400;

        // Visuals
        if (isLaser) {
            this.setTint(0x00ffff);
            this.setScale(4, 1);
            this.setRotation(Math.atan2(dy, dx));

            // Laser trail (Graphics)
            this.scene.time.addEvent({
                delay: 20,
                callback: () => {
                    if (this.active) {
                        const particle = this.scene.add.rectangle(this.x, this.y, 10, 2, 0x00ffff);
                        particle.setRotation(this.rotation);
                        this.scene.tweens.add({
                            targets: particle,
                            alpha: 0,
                            duration: 200,
                            onComplete: () => particle.destroy()
                        });
                    }
                },
                repeat: 10
            });

        } else {
            this.setTint(0xff4444); // Bright red-orange
            this.setScale(1.5);
            this.setRotation(Math.atan2(dy, dx));

            // Bullet trail (fading circles)
            this.scene.time.addEvent({
                delay: 50,
                callback: () => {
                    if (this.active) {
                        const particle = this.scene.add.circle(this.x, this.y, 4, 0xffaa00);
                        this.scene.tweens.add({
                            targets: particle,
                            scale: 0,
                            alpha: 0,
                            duration: 300,
                            onComplete: () => particle.destroy()
                        });
                    }
                },
                repeat: 20
            });
        }

        const mag = Math.sqrt(dx * dx + dy * dy);
        this.setVelocity((dx / mag) * speed, (dy / mag) * speed);

        this.scene.time.delayedCall(2000, () => {
            this.kill();
        });
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.y < 0 || this.y > 600 || this.x < 0 || this.x > 2000) {
            this.kill();
        }
    }
}
