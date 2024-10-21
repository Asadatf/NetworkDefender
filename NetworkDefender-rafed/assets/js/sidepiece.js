var config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 1024,
    scene: {
        init: init,
        preload: preload,
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

function init() {
    // QTE state variables
    this.qteActive = false;
    this.qteTimer = 0;
    this.qteDuration = 2000; // QTE duration in milliseconds
    this.qteSuccess = false;

    // Text setup for QTE Action
    this.qteActionText = this.add.text(512, 512, '', {
        fontSize: '32px',
        fill: '#ff0000',
        align: 'center',
        backgroundColor: '#000000'
    }).setOrigin(0.1).setVisible(false).setDepth(1);
}

function preload() {
    this.load.image('background', 'assets/images/background.jpeg');
    this.load.image('defender', 'assets/images/defender.png');
    this.load.image('obstacle', 'assets/images/obstacle.png'); // Load obstacle image
    this.load.image('attacker', 'assets/images/mitmattacker.png');

}

function create() {
    // Background
    var background = this.add.image(0, 0, 'background');
    background.setOrigin(0, 0);

    // Creating Game Avatar
    this.defender = this.physics.add.image(100, 100, 'defender');
    this.defender.setCollideWorldBounds(true);
    this.defender.setScale(0.15);

    this.attacker = this.physics.add.image(512,100 , 'attacker');
    this.attacker.setCollideWorldBounds(true);
    this.attacker.setScale(0.175).setDepth(1);

    // Adding WASD keyboard inputs
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Create static obstacles
    this.obstacles = this.physics.add.staticGroup();

    // Add obstacles at different positions
    this.obstacles.create(300, 300, 'obstacle').setScale(0.5).refreshBody();
    this.obstacles.create(700, 500, 'obstacle').setScale(0.5).refreshBody();
    this.obstacles.create(400, 700, 'obstacle').setScale(0.5).refreshBody();

    // Enable collision between defender and obstacles
    this.physics.add.collider(this.defender, this.obstacles);

    // Variable to track if the player is near an obstacle
    this.nearObstacle = false;
    this.interactionText = this.add.text(400, 960, '', { fontSize: '24px', fill: '#ffffff' });
    this.interactionText.setOrigin(0.5);
    
    // Popup Menu
    this.menuActive = false;
    this.menuBackground = this.add.rectangle(512, 512, 400, 300, 0x000000, 0.7).setVisible(false);
    this.menuText = this.add.text(512, 512, 'Obstacle Menu\n(Press ESC to Exit)', {
        fontSize: '32px',
        fill: '#ffffff',
        align: 'center'
    }).setOrigin(0.5).setVisible(false);

    // Randomly launch an MITM attack
    console.log("Setting up timed event");
    this.time.addEvent({
        delay: Phaser.Math.Between(5000, 10000), // Random interval between 5 to 10 seconds
        callback: launchMITMAttack,
        callbackScope: this,
        loop: false
    });
    console.log("Timed event setup complete");
}

function launchMITMAttack() {
    console.log("inside mitm");
    if (this.qteActive) return; // Don't launch if a QTE is already active
    console.log("middle of mitm");
    this.qteActive = true;
    this.qteTimer = this.qteDuration;
    this.qteSuccess = false;
    this.qteActionText.setText('Press Spacebar to Encrypt!').setVisible(true);
    console.log("end of mitm");
}

function update() {
    // Reset defender velocity
    this.defender.body.setVelocity(0);

    // Movement using WASD keys
    if (this.wKey.isDown) {
        this.defender.body.setVelocityY(-250);
    } else if (this.sKey.isDown) {
        this.defender.body.setVelocityY(250);
    }

    if (this.aKey.isDown) {
        this.defender.body.setVelocityX(-250);
        this.defender.flipX = true; // Flip character to the left when moving left
    } else if (this.dKey.isDown) {
        this.defender.body.setVelocityX(250);
        this.defender.flipX = false; // Face right when moving right
    }

    if (this.qteActive) {
        this.qteTimer -= this.game.loop.delta; // Decrease the QTE timer

        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            // Player pressed Spacebar, QTE succeeded
            this.qteSuccess = true;
            this.qteActive = false;
            this.qteActionText.setText('Encryption Successful!').setFill('#00ff00'); // Change text to green
            this.time.delayedCall(1000, () => {
                this.qteActionText.setVisible(false); // Hide text after 1 second
            }, [], this);
        } else if (this.qteTimer <= 0) {
            // QTE failed (timer expired)
            this.qteActive = false;
            this.qteActionText.setText('MITM Attack Successful!').setFill('#ff0000'); // Change text to red
            this.time.delayedCall(1000, () => {
                this.qteActionText.setVisible(false); // Hide text after 1 second
            }, [], this);
        }
    }

    // Check for proximity to obstacles
    this.nearObstacle = false;
    this.obstacles.children.iterate((obstacle) => {
        if (Phaser.Math.Distance.Between(this.defender.x, this.defender.y, obstacle.x, obstacle.y) < 100) {
            this.nearObstacle = true;
        }
    });

    // Display interaction prompt if near an obstacle
    if (this.nearObstacle && !this.menuActive) {
        this.interactionText.setText('Press Spacebar to Interact');
    } else {
        this.interactionText.setText('');
    }

    // Show the obstacle menu when spacebar is pressed near an obstacle
    if (Phaser.Input.Keyboard.JustDown(this.spaceBar) && this.nearObstacle) {
        this.menuActive = true;
        this.menuBackground.setVisible(true);
        this.menuText.setVisible(true);
        this.defender.body.setVelocity(0); // Stop the player while the menu is active
    }

    // Close the menu when ESC is pressed
    if (Phaser.Input.Keyboard.JustDown(this.escKey) && this.menuActive) {
        this.menuActive = false;
        this.menuBackground.setVisible(false);
        this.menuText.setVisible(false);
    }
}
