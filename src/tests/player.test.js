import { describe, it, expect, vi } from 'vitest';
import { Player } from '../entities/Player';

// Mock Phaser
global.Phaser = {
    Physics: {
        Arcade: {
            Sprite: class {
                constructor(scene, x, y, texture) {
                    this.scene = scene;
                    this.x = x;
                    this.y = y;
                    this.texture = texture;
                }
                setAlpha() { }
                setScale() { }
                setCollideWorldBounds() { }
                setGravityY() { }
            }
        }
    }
};

describe('Player Logic', () => {
    const mockScene = {
        add: {
            existing: vi.fn(),
            graphics: vi.fn(() => ({
                clear: vi.fn(),
                fillStyle: vi.fn(),
                fillRect: vi.fn(),
                setPosition: vi.fn()
            }))
        },
        physics: {
            add: {
                existing: vi.fn()
            }
        },
        time: {
            now: 0,
            delayedCall: vi.fn()
        }
    };

    it('should initialize with default weapon settings', () => {
        const player = new Player(mockScene, 100, 100, 'TEST', 'NORMAL');
        expect(player.weaponType).toBe('NORMAL');
        expect(player.fireRate).toBe(200);
    });

    it('should update fire rate for SPREAD gun', () => {
        const player = new Player(mockScene, 100, 100);
        player.updateWeaponConfig('SPREAD');
        expect(player.weaponType).toBe('SPREAD');
        expect(player.fireRate).toBe(400);
    });

    it('should update fire rate for LASER', () => {
        const player = new Player(mockScene, 100, 100);
        player.updateWeaponConfig('LASER');
        expect(player.weaponType).toBe('LASER');
        expect(player.fireRate).toBe(100);
    });

    it('should update fire rate for MACHINE_GUN', () => {
        const player = new Player(mockScene, 100, 100);
        player.updateWeaponConfig('MACHINE_GUN');
        expect(player.weaponType).toBe('MACHINE_GUN');
        expect(player.fireRate).toBe(80);
    });

    it('should set bullet speed multiplier for RAPID', () => {
        const player = new Player(mockScene, 100, 100);
        player.updateWeaponConfig('RAPID');
        expect(player.weaponType).toBe('RAPID');
        expect(player.bulletSpeedMultiplier).toBe(2);
    });
});
