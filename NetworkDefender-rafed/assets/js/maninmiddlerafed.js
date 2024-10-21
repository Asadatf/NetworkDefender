var config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 1024,
    scene: {
        preload: preload,
        init: init,
        create: create,
        update: update,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        }
    },
};

var game = new Phaser.Game(config);

var packet;
var attacker;
var packetSpeed = 200;
var qteActive = false;
var encryptionMinigameActive = false;
var score = 0;
var upgrades = 0;

function preload() {
    this.load.image('background', 'assets/images/background.jpeg');
    this.load.image('defender', 'assets/images/defender.png');
    this.load.image('sender', 'assets/images/sender.png');
    this.load.image('receiver', 'assets/images/receiver.png');
    this.load.image('attacker', 'assets/images/attacker.png');
    this.load.image('packet', 'assets/images/packet.png');
}

function create() {
    // Add background
    this.add.image(0, 0, 'background').setOrigin(0, 0);

    // Add sender, receiver, and player avatar (defender)
    var sender = this.add.image(100, 512, 'sender').setScale(0.5);
    var receiver = this.add.image(924, 512, 'receiver').setScale(0.5);
    this.defender = this.physics.add.image(300, 512, 'defender').setScale(0.5);
    
    // Add attacker
    attacker = this.physics.add.image(512, 512, 'attacker').setScale(0.5);
    attacker.setCollideWorldBounds(true);
    
    // Add packet
    packet = this.physics.add.image(150, 512, 'packet').setScale(0.2);
    
    // Input for QTE
    this.keys = this.input.keyboard.addKeys({
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        e: Phaser.Input.Keyboard.KeyCodes.E
    });
    
    // Timer for packet transfer and attacks
    this.packetTransferTimer = this.time.addEvent({
        delay: 5000,
        callback: launchPacket,
        callbackScope: this,
        loop: true
    });

    // Text to display events and scores
    this.scoreText = this.add.text(512, 960, 'Score: 0', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
}

function update() {
    if (qteActive && Phaser.Input.Keyboard.JustDown(this.keys.space)) {
        completeQTE();
    }

    if (encryptionMinigameActive && Phaser.Input.Keyboard.JustDown(this.keys.e)) {
        completeEncryptionMinigame();
    }
}
function config

function launchPacket() {
    packet.setPosition(150, 512);
    this.physics.moveTo(packet, 924, 512, packetSpeed);

    // Random chance of MITM attack
    if (Math.random() < 0.5) {
        this.time.delayedCall(2000, triggerMITMAttack, [], this);
    }
}

function triggerMITMAttack() {
    qteActive = true;
    this.scoreText.setText('MITM Attack! Press SPACE to block!');
    
    // Move attacker towards packet
    this.physics.moveTo(attacker, packet.x, packet.y, 150);
    
    // If not countered in time, initiate encryption minigame
    this.time.delayedCall(3000, initiateEncryptionMinigame, [], this);
}

function completeQTE() {
    qteActive = false;
    this.scoreText.setText('Attack Blocked! +1 Point');
    score += 1;
    updateScore();
    
    // Stop the attacker
    attacker.setVelocity(0, 0);
}

function initiateEncryptionMinigame() {
    if (!qteActive) { // If QTE failed
        encryptionMinigameActive = true;
        this.scoreText.setText('Encrypt Packet! Press E!');
    }
}

function completeEncryptionMinigame() {
    encryptionMinigameActive = false;
    this.scoreText.setText('Packet Encrypted! +1 Point');
    score += 1;
    updateScore();
    
    // Stop the attacker
    attacker.setVelocity(0, 0);
}

function updateScore() {
    this.scoreText.setText('Score: ' + score);
}
