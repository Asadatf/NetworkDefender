var config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "phaser-example",
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
  },
  dom: {
    createContainer: true,
  },
};

var game = new Phaser.Game(config);

// game.add.plugin(PhaserInput.Plugin);

function init() {
  this.packetSpeed = 20;
  this.encryptionMinigameActive = false;
  this.score = 0;
  this.upgrades = 0;
  this.qteActive = false;
  this.qteTimer = 0;
  this.qteDuration = 10000;
  this.qteSuccess = false;
  this.menuActive = false;

  // Text setup for QTE Action
  this.qteActionText = this.add
    .text(window.innerWidth / 2, 0, "", {
      fontSize: "32px",
      fill: "#ff0000",
      align: "center",
      backgroundColor: "#000000",
    })
    .setOrigin(0.5, 0)
    .setDepth(1);

  // Text setup for interaction prompt
  this.interactText = this.add
    .text(window.innerWidth / 2, window.innerHeight / 2, "", {
      fontSize: "24px",
      fill: "#ffffff",
    })
    .setOrigin(0.5, 0)
    .setDepth(1)
    .setVisible(false);

  // Popup Menu
  this.menuActive = false;
  this.menuBackground = this.add
    .rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      400,
      300,
      0x000000,
      0.7
    )
    .setVisible(false);
  this.menuText = this.add
    .text(
      this.scale.width / 2,
      this.scale.height / 2 - 50,
      "Write your message:",
      {
        fontSize: "32px",
        fill: "#ffffff",
        align: "center",
      }
    )
    .setOrigin(0.5)
    .setVisible(false);
}

function preload() {
  this.load.image("background", "assets/images/background.jpeg");
  this.load.image("defender", "assets/images/defender.png");
  this.load.image("receiver", "assets/images/receiver.png");
  this.load.image("attacker", "assets/images/attacker.png");
  this.load.image("router", "assets/images/router.png");
  this.load.image("switch", "assets/images/switch.png");
  this.load.image("packet", "assets/images/packet.png");
  this.load.image("messageBox", "assets/images/message_box.png");
  this.load.plugin("rexinputtextplugin", "assets/plugins/inputPlugin.js", true);
}

function create() {
  // Add background
  this.background = this.add.image(0, 0, "background");
  this.background.setOrigin(0, 0);

  // Scale the background to fit the screen size
  this.background.displayWidth = this.scale.width;
  this.background.displayHeight = this.scale.height;

  // Create static obstacles group
  this.obstacles = this.physics.add.staticGroup();

  // Scale obstacles based on screen size
  var obstacleScale = Math.min(
    this.scale.width / 10000,
    this.scale.height / 10000
  );
  this.leftSwitch = this.obstacles
    .create(window.innerWidth / 4, 300, "switch")
    .setScale(obstacleScale)
    .refreshBody();
  this.rightSwitch = this.obstacles
    .create((window.innerWidth * 3) / 4, 300, "switch")
    .setScale(obstacleScale)
    .refreshBody();

  this.defender = this.physics.add.image(
    this.leftSwitch.x - 100,
    this.leftSwitch.y,
    "defender"
  );
  this.defender.setCollideWorldBounds(true);
  this.defender.setScale(0.15);

  this.receiver = this.physics.add.image(
    this.rightSwitch.x + 50,
    this.rightSwitch.y,
    "receiver"
  );
  this.receiver.flipX = true;
  this.receiver.setCollideWorldBounds(true);
  this.receiver.setScale(0.15);

  this.router = this.obstacles
    .create(window.innerWidth / 2, 200, "router")
    .setScale(obstacleScale)
    .refreshBody();

  this.physics.add.collider(this.defender, this.obstacles);

  // Add packet
  this.packet = this.physics.add
    .image(this.defender.x + 10, this.defender.y, "packet")
    .setScale(0.05);

  // Input for QTE and movement
  this.keys = this.input.keyboard.addKeys({
    space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    x: Phaser.Input.Keyboard.KeyCodes.X,
    e: Phaser.Input.Keyboard.KeyCodes.E,
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D,
    esc: Phaser.Input.Keyboard.KeyCodes.ESC,
  });
}

function update() {
  this.defender.body.setVelocity(0);

  // Keyboard Movement using WASD
  if (this.keys.a.isDown && !this.menuActive) {
    this.defender.body.setVelocityX(-250);
    this.defender.flipX = true; // Flip the sprite to face left
  } else if (this.keys.d.isDown && !this.menuActive) {
    this.defender.body.setVelocityX(250);
    this.defender.flipX = false; // Flip the sprite to face right
  }

  if (this.keys.w.isDown && !this.menuActive) {
    this.defender.body.setVelocityY(-250);
  } else if (this.keys.s.isDown && !this.menuActive) {
    this.defender.body.setVelocityY(250);
  }

  // Check for proximity to obstacles and show interaction prompt
  this.nearObstacle = false;
  this.currentObstacleType = "";

  this.obstacles.children.iterate((obstacle) => {
    if (
      Phaser.Math.Distance.Between(
        this.defender.x,
        this.defender.y,
        obstacle.x,
        obstacle.y
      ) < 100
    ) {
      this.nearObstacle = true;
    }
  });

  // Display interaction prompt if near an obstacle
  if (this.nearObstacle && !this.menuActive) {
    this.interactText
      .setText(`Near ${this.currentObstacleType}\nPress E to Interact`)
      .setVisible(true);
  } else {
    this.interactText.setVisible(false);
  }

  // Show the context-specific menu when spacebar is pressed near an obstacle
  if (Phaser.Input.Keyboard.JustDown(this.keys.e) && this.nearObstacle) {
    openMessagePopup.call(this);
  }
}

function openMessagePopup() {
  if (!this.menuActive) {
    this.lastMessage = ""; // Variable to hold the last submitted message
    this.packetTween = null;

    this.nearObstacle = false;
    this.menuActive = true;

    // Popup Menu
    this.menuBackground = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      400,
      300,
      0x000000,
      0.7
    );
    this.menuText = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 - 50,
        "Write your message:",
        {
          fontSize: "32px",
          fill: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5);

    this.userMessage = "";
    // Initialize message input
    this.messageInput = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "_", {
        fontSize: "24px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Variable to hold the user's typed message
    this.userMessage = this.lastMessage || ""; // If there's already a message, start with it

    // Listen for keyboard input to update the typed message
    this.input.keyboard.on("keydown", (event) => {
      if (this.menuActive) {
        // Handle backspace (delete last character)
        if (event.key === "Backspace") {
          this.userMessage = this.userMessage.slice(0, -1);
        } else if (event.key.length === 1 && event.key.match(/[a-zAZ0-9 ]/)) {
          // Check if Shift is pressed for capitalization
          if (event.shiftKey && event.key.match(/[a-z]/)) {
            console.log(
              "Key pressed:",
              event.key,
              "Shift active:",
              event.shiftKey
            );

            this.userMessage += event.key.toUpperCase();
          } else {
            this.userMessage += event.key;
          }
        } else if (event.key === "Enter") {
          // Submit the message when Enter is pressed
          this.lastMessage = this.userMessage; // Store the message persistently
          console.log("Message submitted:", this.lastMessage);

          this.encryptedSentence = randomCaesarCipher(this.lastMessage);

          // Display the message in a speech bubble on the sender's side
          displaySpeechBubble.call(
            this,
            this.leftSwitch.x,
            this.leftSwitch.y - 50,
            this.encryptedSentence
          ); // Adjusted position

          // Launch the packet to the receiver's switch
          launchPacket.call(this);

          // Close the popup
          this.menuBackground.destroy();
          this.menuText.destroy();
          this.messageInput.destroy();
          this.menuActive = false;
          this.nearObstacle = true;
        }

        // Update the message input text in the popup
        this.messageInput.setText(this.userMessage + "_");
      }
    });
  }
}

function displaySpeechBubble(x, y, message) {
  // Create a speech bubble at the given coordinates
  // const speechBubble = this.add.image(x, y, "speechBubble");
  // speechBubble.setOrigin(0.5);
  // speechBubble.setScale(0.5);

  // Add the user's message inside the bubble
  const bubbleText = this.add
    .text(x, y, message, {
      fontSize: "18px",
      fill: "#000000",
      wordWrap: { width: 250, useAdvancedWrap: true },
    })
    .setOrigin(0.5);

  // Optionally, you can add an animation or movement to make the speech bubble appear more dynamic.
  // For example, make the speech bubble pop up or appear with a slight delay.

  // Set a timer to automatically remove the speech bubble after some time or when the user clicks to continue.
  this.time.delayedCall(3000, () => {
    // speechBubble.destroy();
    bubbleText.destroy();
  });
}

// Function to launch a packet from the sender to the receiver
function launchPacket() {
  // Animate the packet from sender to receiver
  packetTween = this.tweens.add({
    targets: this.packet,
    x: this.rightSwitch.x,
    y: this.rightSwitch.y,
    duration: 2000,
    ease: "Linear",
    onComplete: () => {
      displayReceivedMessage.call(this);
    },
  });
}

// Function to display the received message at the receiver's switch
function displayReceivedMessage() {
  displaySpeechBubble.call(
    this,
    this.rightSwitch.x,
    this.rightSwitch.y - 50,
    "Received: " + this.encryptedSentence
  );
}

function randomCaesarCipher(sentence) {
  const shift = 3; // Shift value for the Caesar Cipher
  const words = sentence.split(" ");

  if (words.length > 6) {
    console.error("The sentence must have maximum of 6 words.");
    return null;
  }

  // Helper function to apply Caesar Cipher on a word
  const caesarEncrypt = (word, shift) => {
    return word
      .split("")
      .map((char) => {
        if (/[a-zA-Z]/.test(char)) {
          const isUpperCase = char === char.toUpperCase();
          const base = isUpperCase ? 65 : 97; // ASCII codes for 'A' or 'a'
          return String.fromCharCode(
            ((char.charCodeAt(0) - base + shift) % 26) + base
          );
        }
        return char; // Non-alphabet characters remain unchanged
      })
      .join("");
  };

  // Randomly pick two unique indices from the 6 words
  let indices = [];
  while (indices.length < 2) {
    const randomIndex = Math.floor(Math.random() * 6);
    if (!indices.includes(randomIndex)) {
      indices.push(randomIndex);
    }
  }

  // Encrypt the chosen words
  indices.forEach((index) => {
    words[index] = caesarEncrypt(words[index], shift);
  });

  return words.join(" ");
}

// Example Usage
const sentence = "my name is not Asad Tariq";
const encryptedSentence = randomCaesarCipher(sentence);
console.log("Original Sentence:", sentence);
console.log("Encrypted Sentence:", encryptedSentence);
