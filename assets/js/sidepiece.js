var config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 1024,
    scene: {
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

function preload() {
    this.load.image('background', 'assets/images/background.jpeg');
    this.load.image('defender', 'assets/images/defender.png');
    this.load.image('obstacle', 'assets/images/obstacle.png'); // Load obstacle image
}

function create() {
    // Background
    var background = this.add.image(0, 0, 'background');
    background.setOrigin(0, 0);

    // Creating Game Avatar
    this.defender = this.physics.add.image(100, 100, 'defender');
    this.defender.setCollideWorldBounds(true);
    this.defender.setScale(0.15);

    // Adding keyboard inputs
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // touch controls
    this.touch = this.createTouchControls();

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
}

function update() {
    // Reset defender velocity
    this.defender.body.setVelocity(0);


    // keyboard
    if (this.cursors.left.isDown) {
        this.defender.body.setVelocityX(-250);
        this.defender.flipX = true;
    } else if (this.cursors.right.isDown) {
        this.defender.body.setVelocityX(250);
        this.defender.flipX = false;
    }

    if (this.cursors.up.isDown) {
        this.defender.body.setVelocityY(-250);
    } else if (this.cursors.down.isDown) {
        this.defender.body.setVelocityY(250);
    }

    //touch
    if (this.touch.leftPressed) {
        this.defender.body.setVelocityX(-250);
        this.defender.flipX = true;
    } else if (this.touch.rightPressed) {
        this.defender.body.setVelocityX(250);
        this.defender.flipX = false;
    }

    if (this.touch.upPressed) {
        this.defender.body.setVelocityY(-250);
    } else if (this.touch.downPressed) {
        this.defender.body.setVelocityY(250);
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
