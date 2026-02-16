import Phaser from 'phaser';

export class WelcomeScene extends Phaser.Scene {
    constructor() {
        super('WelcomeScene');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

        // Stylized Title
        this.add.text(width / 2, 100, 'CONTRA', {
            fontSize: '84px',
            fill: '#ff0000',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5).setStroke('#ffffff', 8);

        this.add.text(width / 2, 170, 'REBORN', {
            fontSize: '42px',
            fill: '#ffffff',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // HTML Overlay for Form
        const htmlContent = `
            <div style="color: white; font-family: 'Courier New'; text-align: center; background: rgba(0,0,0,0.8); padding: 20px; border: 2px solid #ff0000; border-radius: 10px; width: 300px;">
                <h3 style="margin-top: 0; color: #ff0000;">MISSION BRIEFING</h3>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;">SOLDIER NAME:</label>
                    <input type="text" id="playerName" placeholder="ENTER NAME" style="width: 100%; padding: 5px; background: #222; color: #fff; border: 1px solid #555;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px;">CHOOSE WEAPON:</label>
                    <select id="weaponType" style="width: 100%; padding: 5px; background: #222; color: #fff; border: 1px solid #555;">
                        <option value="NORMAL">NORMAL RIFLE</option>
                        <option value="SPREAD">SPREAD GUN</option>
                        <option value="LASER">LASER BEAM</option>
                    </select>
                </div>
                <button id="startGame" style="background: #ff0000; color: white; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; width: 100%;">START MISSION</button>
            </div>
        `;

        const form = this.add.dom(width / 2, height / 2 + 50).createFromHTML(htmlContent);

        form.addListener('click');
        form.on('click', (event) => {
            if (event.target.id === 'startGame') {
                const playerName = document.getElementById('playerName').value || 'RECRUIT';
                const weaponType = document.getElementById('weaponType').value;

                this.scene.start('MainScene', { playerName, weaponType });
            }
        });

        // Instructions
        this.add.text(width / 2, height - 50, 'CONTROLS: WASD to MOVE | SPACE to SHOOT', {
            fontSize: '16px',
            fill: '#888888',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
    }
}
