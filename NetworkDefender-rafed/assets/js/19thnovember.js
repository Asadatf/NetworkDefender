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
            debug: false, // Turn off debug for cleaner visuals
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
    this.message = ""; // Initialize the message string
    this.nearSwitch = false; // Initialize nearSwitch to false

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
    this.background.displayWidth = this.scale.width;
    this.background.displayHeight = this.scale.height;

    // Create static obstacles group
    this.obstacles = this.physics.add.staticGroup();
    var obstacleScale = Math.min(this.scale.width / 10000, this.scale.height / 10000);
    const leftSwitch = this.obstacles.create(window.innerWidth / 4, 300, "switch").setScale(obstacleScale).refreshBody();
    const rightSwitch = this.obstacles.create(window.innerWidth * 3 / 4, 300, "switch").setScale(obstacleScale).refreshBody();

    // Defender setup with physics
    this.defender = this.physics.add.image(leftSwitch.x - 100, leftSwitch.y, "defender");
    this.defender.setCollideWorldBounds(true);
    this.defender.setScale(0.15);

    // Enable collision between defender and switches
    this.physics.add.collider(this.defender, this.obstacles);

    // Input keys for movement and interactions
    this.keys = this.input.keyboard.addKeys({
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        e: Phaser.Input.Keyboard.KeyCodes.E, // Key for interacting with switches
    });

    // Text prompt for interaction
    this.interactText = this.add.text(0, 0, "Press E to write a message", {
        fontSize: "24px",
        fill: "#ffffff"
    }).setVisible(false).setOrigin(0.5);

    // Detect overlap for interaction prompts
    this.physics.add.overlap(
        this.defender,
        this.obstacles.getChildren(), // Get all switch objects
        (defender, switchObj) => {
            this.nearSwitch = true; // Flag defender is near a switch
            this.interactText.setPosition(switchObj.x, switchObj.y - 50).setVisible(true);
        },
        null,
        this
    );

    // Score Text
    this.scoreText = this.add.text(window.innerWidth / 2, 100, "Score: 0", {
        fontSize: "24px",
        fill: "#ffffff"
    }).setOrigin(0.5);
}

function update() {
    const speed = 250; // Movement speed
    let moving = false; // Flag to track movement

    // Reset defender's velocity only when no keys are pressed
    if (this.keys.a.isDown) {
        this.defender.body.setVelocityX(-speed); // Move left
        this.defender.flipX = true; // Flip sprite to face left
        moving = true;
    } else if (this.keys.d.isDown) {
        this.defender.body.setVelocityX(speed); // Move right
        this.defender.flipX = false; // Flip sprite to face right
        moving = true;
    }

    if (this.keys.w.isDown) {
        this.defender.body.setVelocityY(-speed); // Move up
        moving = true;
    } else if (this.keys.s.isDown) {
        this.defender.body.setVelocityY(speed); // Move down
        moving = true;
    }

    // Stop defender's velocity if no movement keys are pressed
    if (!moving) {
        this.defender.body.setVelocity(0);
    }

    // Hide the interaction text if not near a switch
    if (!this.nearSwitch) {
        this.interactText.setVisible(false);
    }

    // Check for interaction key press
    if (this.keys.e.isDown && this.nearSwitch && !this.popupVisible) {
        openMessagePopup.call(this);
    }

    // Reset the nearSwitch flag for the next frame
    this.nearSwitch = false;
}

// Function to complete the encryption minigame
function completeEncryptionMinigame() {

}

// Function to open the message popup
// Variable to hold the last submitted message (this will persist)
// Variables for the sender and receiver switch positions (these will be the coordinates for the switches)
// Variables for the sender and receiver switch positions (these will be the coordinates for the switches)
const senderSwitch = { x: 100, y: 200 };  // Example coordinates for the sender's switch
const receiverSwitch = { x: 600, y: 200 };  // Example coordinates for the receiver's switch

let lastMessage = '';  // Variable to hold the last submitted message
let packet = null;  // To store the packet (the moving object)
let packetTween = null;  // To handle the tween animation for packet movement

function openMessagePopup() {
    if (!this.popupVisible) {
        this.popupVisible = true;

        // Display popup background
        this.popupBackground = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 400, 300, 0x000000, 0.7);
        this.popupText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, "Write your message:", {
            fontSize: "24px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        // Initialize message input
        this.messageInput = this.add.text(this.scale.width / 2, this.scale.height / 2, "_", {
            fontSize: "24px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        // Variable to hold the user's typed message
        this.userMessage = lastMessage || "";  // If there's already a message, start with it

        // Listen for keyboard input to update the typed message
        this.input.keyboard.on('keydown', (event) => {
            if (this.popupVisible) {
                // Handle backspace (delete last character)
                if (event.key === "Backspace") {
                    this.userMessage = this.userMessage.slice(0, -1);
                } else if (event.key.length === 1 && event.key.match(/[a-zAZ0-9 ]/)) {
                    // Add the character to the message if it's a valid key
                    this.userMessage += event.key;
                } else if (event.key === "Enter") {
                    // Submit the message when Enter is pressed
                    lastMessage = this.userMessage;  // Store the message persistently
                    console.log("Message submitted:", lastMessage);

                    // Display the message in a speech bubble on the sender's side
                    displaySpeechBubble.call(this, senderSwitch.x, senderSwitch.y - 50, lastMessage);  // Adjusted position

                    // Launch the packet to the receiver's switch
                    launchPacket.call(this);

                    // Close the popup
                    this.popupBackground.destroy();
                    this.popupText.destroy();
                    this.messageInput.destroy();
                    this.popupVisible = false;
                }

                // Update the message input text in the popup
                this.messageInput.setText(this.userMessage + "_");
            }
        });
    }
}

// Function to display the message in a comic-style speech bubble
function displaySpeechBubble(x, y, message) {
    // Create a speech bubble at the given coordinates
    const speechBubble = this.add.image(x, y, 'speechBubble');  // Adjust bubble position
    speechBubble.setOrigin(0.5);
    speechBubble.setScale(0.5);  // Adjust the size of the bubble if needed

    // Add the user's message inside the bubble
    const bubbleText = this.add.text(x, y, message, {
        fontSize: '18px',
        fill: '#000000',
        wordWrap: { width: 250, useAdvancedWrap: true }
    }).setOrigin(0.5);

    // Optionally, you can add an animation or movement to make the speech bubble appear more dynamic.
    // For example, make the speech bubble pop up or appear with a slight delay.

    // Set a timer to automatically remove the speech bubble after some time or when the user clicks to continue.
    this.time.delayedCall(3000, () => {
        speechBubble.destroy();
        bubbleText.destroy();
    });
}

// Function to launch a packet from the sender to the receiver
function launchPacket() {
    // Create the packet as a rectangle or image
    packet = this.add.rectangle(senderSwitch.x, senderSwitch.y - 50, 20, 10, 0x00ff00);  // Green packet for example, above sender's switch

    // Animate the packet from sender to receiver
    packetTween = this.tweens.add({
        targets: packet,
        x: receiverSwitch.x,
        y: receiverSwitch.y - 50,  // Adjust the final position to be above the receiver's switch
        duration: 2000,  // 2 seconds to move the packet
        ease: 'Linear',
        onComplete: () => {
            // When the packet reaches the receiver, display the message
            displayReceivedMessage.call(this);
        }
    });
}

// Function to display the received message at the receiver's switch
function displayReceivedMessage() {
    // Display the received message on the receiver's switch with a speech bubble
    displaySpeechBubble.call(this, receiverSwitch.x, receiverSwitch.y - 50, "Received: " + lastMessage);
}

