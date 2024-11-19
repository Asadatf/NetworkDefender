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
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

var game = new Phaser.Game(config);

function init() {
  this.packetSpeed = 100;
  this.encryptionMinigameActive = false;
  this.score = 0;
  this.upgrades = 0;
  this.qteActive = false;
  this.qteTimer = 0;
  this.qteDuration = 10000;
  this.qteSuccess = false;
  this.popupVisible = false;

  // Text setup for QTE Action
  this.qteActionText = this.add
    .text(512, 0, "", {
      fontSize: "32px",
      fill: "#ff0000",
      align: "center",
      backgroundColor: "#000000",
    })
    .setOrigin(0.5, 0)
    .setDepth(1);

  // Text setup for interaction prompt
  this.interactText = this.add
    .text(512, 450, "", { fontSize: "24px", fill: "#ffffff" })
    .setOrigin(0.5, 0)
    .setDepth(1)
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
}

function create() {
  // Add background
  this.add.image(0, 0, "background").setOrigin(0, 0);

  // Add receive
  this.receiver = this.physics.add.image(924, 250, "receiver");
  this.receiver.flipX = true;
  this.receiver.setCollideWorldBounds(true);
  this.receiver.setScale(0.15);

  // Add Defender
  this.defender = this.physics.add.image(100, 250, "defender");
  this.defender.setCollideWorldBounds(true);
  this.defender.setScale(0.15);

  // Add attacker
  this.attacker = this.physics.add.image(512, 100, "attacker").setScale(0.5);
  this.attacker.setCollideWorldBounds(true);
  this.attacker.setScale(0.05);

  // Create static obstacles group
  this.obstacles = this.physics.add.staticGroup();

  // Scale obstacles based on the screen size
  var obstacleScale = Math.min(
    this.scale.width / 10000,
    this.scale.height / 10000
  ); // Adjust this scaling factor as needed

  // Add routers, switches, and firewalls at different positions
  this.obstacles
    .create(512, 200, "router")
    .setScale(obstacleScale)
    .refreshBody();
  this.obstacles
    .create(512 / 2, 300, "switch")
    .setScale(obstacleScale)
    .refreshBody();
  this.obstacles
    .create(512 + 512 / 2, 300, "switch")
    .setScale(obstacleScale)
    .refreshBody();

  // Enable collision between defender and obstacles
  this.physics.add.collider(this.defender, this.obstacles);

  // Add packet
  this.packet = this.physics.add
    .image(this.defender.x + 10, this.defender.y, "packet")
    .setScale(0.05);

  // Input for QTE
  this.keys = this.input.keyboard.addKeys({
    space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    e: Phaser.Input.Keyboard.KeyCodes.E,
  });

  // Text to display events and scores
  this.scoreText = this.add
    .text(512, 100, "Score: 0", { fontSize: "24px", fill: "#ffffff" })
    .setOrigin(0.5);

  // Timer for packet transfer and attacks
  this.packetTransferTimer = this.time.addEvent({
    delay: 1000,
    callback: launchPacket,
    callbackScope: this,
    loop: false,
  });

  // Adding keyboard inputs
  this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  this.defender.body.setVelocity(0);

  // Keyboard Movement
  if (this.cursors.left.isDown) {
    this.defender.body.setVelocityX(-250);
    this.defender.flipX = true;
  } else if (this.cursors.right.isDown) {
    this.defender.body.setVelocityX(250);
    this.defender.flipX = false;
  } else {
    //console.log('neither');
  }

  if (this.cursors.up.isDown) {
    this.defender.body.setVelocityY(-250);
  } else if (this.cursors.down.isDown) {
    this.defender.body.setVelocityY(250);
  } else {
    //console.log('neither');
  }

  console.log(this.encryptionMinigameActive);
  if (this.encryptionMinigameActive) {
    console.log("Encryption minigame is active.");
    this.qteActionText.setText("Press E to Encrypt!");

    // Check if the "E" key is pressed
    if (this.keys.e.isDown) {
      completeEncryptionMinigame.call(this);
    }
    return;
  }

  if (this.qteActive) {
    this.qteTimer -= this.game.loop.delta; // Decrease the QTE timer

    if (this.keys.space.isDown) {
      // Player pressed Spacebar, QTE succeeded
      this.encryptionMinigameActive = false;
      this.qteSuccess = true;
      this.qteActive = false;
      this.qteActionText.setText("Encryption Successful!").setFill("#00ff00"); // Change text to green
      this.time.delayedCall(
        3000,
        () => {
          this.qteActionText.setVisible(false); // Hide text after 1 second
        },
        [],
        this
      );
    } else if (this.qteTimer <= 0) {
      // QTE failed (timer expired)
      this.qteActive = false;
      this.qteActionText.setText("MITM Attack Successful!").setFill("#ff0000"); // Change text to red
      this.time.delayedCall(
        1000,
        () => {
          this.qteActionText.setVisible(false); // Hide text after 1 second
        },
        [],
        this
      );
    }
  }
}

function launchPacket() {
  // this.packet.setPosition(150, 512);
  this.physics.moveTo(
    this.packet,
    this.receiver.x,
    this.receiver.y,
    this.packetSpeed
  );

  // Random chance of MITM attack
  // if (Math.random() < 0.5) {
  this.time.delayedCall(2000, triggerMITMAttack, [], this);
  // }
}

function triggerMITMAttack() {
  console.log("inside mitm attack function");
  if (this.qteActive) return; // Don't launch if a QTE is already active

  console.log("MITM triggered");
  this.qteActive = true;
  this.qteTimer = this.qteDuration;
  this.qteSuccess = false;

  // Move attacker towards packet
  this.physics.moveTo(this.attacker, this.packet.x, this.packet.y, 50);

  this.encryptionMinigameActive = true;
  console.log("Moving to update function");
}

function completeEncryptionMinigame() {
  if (!this.encryptionMinigameActive) {
    return; // Prevent executing if the minigame is not active
  }

  this.encryptionMinigameActive = false;
  console.log("inside encryption function");

  // Simulate the packet's "data" (for example, let's say it's a message like 'ATTACK').
  let packetData = "ATTACK";

  // Encrypt the packet's data using Caesar cipher with a shift of 3.
  let encryptedData = caesarCipher(packetData, 3); // Shifts letters by 3 positions.

  this.score += 1;
  updateScore.call(this);

  this.qteActionText.setText("Press Spacebar to Finish!");

  // Stop the attacker
  this.attacker.setVelocity(0, 0);

  console.log("End of encryption function");
  console.log(this.encryptionMinigameActive);
}

function updateScore() {
  this.scoreText.setText("Score: " + this.score);
}

function caesarCipher(str, shift) {
  let result = ""; // To store the encrypted string.

  // Loop through each character in the input string.
  for (let i = 0; i < str.length; i++) {
    let char = str[i]; // Get the current character.

    // Check if the character is an uppercase letter.
    if (char >= "A" && char <= "Z") {
      let newCharCode = ((char.charCodeAt(0) - 65 + shift) % 26) + 65;
      result += String.fromCharCode(newCharCode);
    }
    // Check if the character is a lowercase letter.
    else if (char >= "a" && char <= "z") {
      let newCharCode = ((char.charCodeAt(0) - 97 + shift) % 26) + 97;
      result += String.fromCharCode(newCharCode);
    }
    // If it's not a letter, append it unchanged.
    else {
      result += char;
    }
  }

  return result; // Return the encrypted result string.
}
