var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: {
        init: init,
        preload: preload,
        create: create,
        update: update,
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    }
};

var game = new Phaser.Game(config);

function init() {
    this.packetSpeed = 20;
    this.encryptionMinigameActive = false;
    this.score = 0;
    this.upgrades = 0;
    this.qteActive = false;
    this.qteTimer = 0;
    this.qteDuration = 10000;
    this.qteSuccess = false;
    this.popupVisible = false;

    // Text setup for QTE Action
    this.qteActionText = this.add.text(window.innerWidth / 2, 0, "", {
        fontSize: "32px",
        fill: "#ff0000",
        align: "center",
        backgroundColor: "#000000",
    }).setOrigin(0.5, 0).setDepth(1);

    // Text setup for interaction prompt
    this.interactText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, "", {
        fontSize: "24px",
        fill: "#ffffff"
    }).setOrigin(0.5, 0).setDepth(1).setVisible(false);
}

function preload() {
    this.load.image("background", "assets/images/background.jpeg");
    this.load.image("defender", "assets/images/defender.png");
    this.load.image("receiver", "assets/images/receiver.png");
    this.load.image("attacker", "assets/images/attacker.png");
    this.load.image("router", "assets/images/router.png");
    this.load.image("switch", "assets/images/switch.png");
    this.load.image("packet", "assets/images/packet.png");
}

function create() {
    // Add background
    this.background = this.add.image(0, 0, 'background');
    this.background.setOrigin(0, 0);
    
    // Scale the background to fit the screen size
    this.background.displayWidth = this.scale.width;
    this.background.displayHeight = this.scale.height;

    // Create static obstacles group
    this.obstacles = this.physics.add.staticGroup();

    // Scale obstacles based on screen size
    var obstacleScale = Math.min(this.scale.width / 10000, this.scale.height / 10000);
    const leftSwitch = this.obstacles.create(window.innerWidth / 4, 300, "switch").setScale(obstacleScale).refreshBody();
    const rightSwitch = this.obstacles.create(window.innerWidth * 3 / 4, 300, "switch").setScale(obstacleScale).refreshBody();

    
    this.defender = this.physics.add.image(leftSwitch.x-100, leftSwitch.y , "defender");        
    this.defender.setCollideWorldBounds(true);
    this.defender.setScale(0.15);

    
    this.attacker = this.physics.add.image(window.innerWidth / 2, 100, "attacker").setScale(0.05); 
    this.attacker.setCollideWorldBounds(true);

    
    this.receiver = this.physics.add.image(rightSwitch.x + 50, rightSwitch.y, "receiver"); 
    this.receiver.flipX = true;
    this.receiver.setCollideWorldBounds(true);
    this.receiver.setScale(0.15);

    
    const router = this.obstacles.create(window.innerWidth / 2, 200, "router").setScale(obstacleScale).refreshBody();

    
    this.physics.add.collider(this.defender, this.obstacles);

    
    // this.packet = this.physics.add.image(this.defender.x + 10, this.defender.y, "packet").setScale(0.05);

    // Input for QTE and movement
    this.keys = this.input.keyboard.addKeys({
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        e: Phaser.Input.Keyboard.KeyCodes.E,
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        esc: Phaser.Input.Keyboard.KeyCodes.ESC,
    });

    // Text to display events and scores
    this.scoreText = this.add.text(window.innerWidth / 2, 100, "Score: 0", {
        fontSize: "24px",
        fill: "#ffffff"
    }).setOrigin(0.5);

    // Timer for packet transfer and attacks
    this.packetTransferTimer = this.time.addEvent({
        delay: 1000,
        callback: launchPacket,
        callbackScope: this,
        loop: false,
    });

    // Popup Menu
    this.menuActive = false;
    this.menuBackground = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 400, 300, 0x000000, 0.7).setVisible(false);
    this.menuText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
        fontSize: '32px',
        fill: '#ffffff',
        align: 'center'
    }).setOrigin(0.5).setVisible(false);
}



function update() {
    this.defender.body.setVelocity(0);

    // Keyboard Movement using WASD
    if (this.keys.a.isDown) {
        this.defender.body.setVelocityX(-250);
        this.defender.flipX = true; // Flip the sprite to face left
    } else if (this.keys.d.isDown) {
        this.defender.body.setVelocityX(250);
        this.defender.flipX = false; // Flip the sprite to face right
    }

    if (this.keys.w.isDown) {
        this.defender.body.setVelocityY(-250);
    } else if (this.keys.s.isDown) {
        this.defender.body.setVelocityY(250);
    }

    // Check for proximity to obstacles and show interaction prompt
    this.nearObstacle = false;
    this.currentObstacleType = '';

    this.obstacles.children.iterate((obstacle) => {
        if (Phaser.Math.Distance.Between(this.defender.x, this.defender.y, obstacle.x, obstacle.y) < 100) {
            this.nearObstacle = true;

            // Determine the type of obstacle
            if (obstacle.texture.key === 'router') {
                this.currentObstacleType = 'Router';
            } else if (obstacle.texture.key === 'switch') {
                this.currentObstacleType = 'Switch';
            }
        }
    });

    // Display interaction prompt if near an obstacle
    if (this.nearObstacle && !this.menuActive) {
        this.interactText.setText(`Near ${this.currentObstacleType}\nPress Spacebar to Interact`).setVisible(true);
    } else {
        this.interactText.setVisible(false);
    }

    // Show the context-specific menu when spacebar is pressed near an obstacle
    if (Phaser.Input.Keyboard.JustDown(this.keys.space) && this.nearObstacle) {
        this.menuActive = true;
        this.menuBackground.setVisible(true);

        // Set menu text based on the obstacle type
        if (this.currentObstacleType === 'Router') {
            this.menuText.setText('Router Menu\n(Configure Router)\nPress ESC to Exit');
        } else if (this.currentObstacleType === 'Switch') {
            this.menuText.setText('Switch Menu\n(Configure Switch)\nPress ESC to Exit');
        }

        this.menuText.setVisible(true);
        this.defender.body.setVelocity(0); // Stop the player while the menu is active
    }

    // Close the menu when ESC is pressed
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc) && this.menuActive) {
        console.log("Closing menu");  // Debug statement
        this.menuActive = false;
        this.menuBackground.setVisible(false);
        this.menuText.setVisible(false);
    }

    // QTE handling
    if (this.encryptionMinigameActive) {
        this.qteActionText.setText("Press E to Encrypt!");
        if (this.keys.e.isDown) {
            completeEncryptionMinigame.call(this);
        }
        return;
    }

    if (this.qteActive) {
        this.qteTimer -= this.game.loop.delta;
        if (this.keys.space.isDown) {
            this.encryptionMinigameActive = false;
            this.qteSuccess = true;
            this.qteActive = false;
            this.qteActionText.setText("Encryption Successful!").setFill("#00ff00");
            this.time.delayedCall(3000, () => {
                this.qteActionText.setVisible(false);
            });
        } else if (this.qteTimer <= 0) {
            this.qteActive = false;
            this.qteActionText.setText("MITM Attack Successful!").setFill("#ff0000");
            this.time.delayedCall(1000, () => {
                this.qteActionText.setVisible(false);
            });
        }
    }
}

// Function to launch packet
// Function to launch packet
function launchPacket() {
    // Define the start and end positions for the packet
    const startX = this.obstacles.getChildren()[0].x; // Left switch position
    const startY = this.obstacles.getChildren()[0].y; // Left switch position
    const endX = this.obstacles.getChildren()[1].x; // Right switch position
    const endY = this.obstacles.getChildren()[1].y; // Right switch position

    // Create a new packet sprite
    const packet = this.physics.add.image(startX, startY, "packet").setScale(0.05);
    
    // Use a tween to animate the packet's movement
    this.tweens.add({
        targets: packet,
        x: endX,
        y: endY,
        duration: 1500, // Duration of the animation in milliseconds
        onComplete: function() {
            // Hide the packet once it reaches the target
            packet.destroy();
        },
        onUpdate: function() {
            // Optional: add any update logic here if needed
        }
    });

    // Optional: You can also update the score or add other logic here if necessary
    this.score += 10; // Example score increment
    this.scoreText.setText("Score: " + this.score); // Update score display
}


// Function to complete the encryption minigame
function completeEncryptionMinigame() {
    // Logic to complete the encryption minigame
}

