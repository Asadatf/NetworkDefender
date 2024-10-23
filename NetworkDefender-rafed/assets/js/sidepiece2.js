var config = {
  type: Phaser.AUTO,
  width: window.innerWidth, // Automatically set the game width to window width
  height: window.innerHeight, // Automatically set the game height to window height
  scene: {
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
    mode: Phaser.Scale.RESIZE, // Resizes game to fit the window
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centers the game in the screen
  },
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image("background", "assets/images/background.jpeg");
  this.load.image("defender", "assets/images/defender.png");
  this.load.image("router", "assets/images/router.png");
  this.load.image("switch", "assets/images/switch.png");
  this.load.image("firewall", "assets/images/firewall.png");
}

function create() {
  // Creating responsive background
  this.background = this.add.image(0, 0, "background");
  this.background.setOrigin(0, 0);

  // Scale the background to fit the screen size
  this.background.displayWidth = this.scale.width;
  this.background.displayHeight = this.scale.height;

  // Creating Game Avatar
  this.defender = this.physics.add.image(100, 100, "defender");
  this.defender.setCollideWorldBounds(true);

  // Scale the defender based on screen size
  var avatarScale = Math.min(this.scale.width / 5000, this.scale.height / 5000); // Adjust this scaling factor as needed
  this.defender.setScale(avatarScale);

  // Adding WASD keyboard inputs
  this.keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D,
    space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    esc: Phaser.Input.Keyboard.KeyCodes.ESC,
  });

  // Create static obstacles group
  this.obstacles = this.physics.add.staticGroup();

  // Scale obstacles based on the screen size
  var obstacleScale = Math.min(
    this.scale.width / 10000,
    this.scale.height / 10000
  ); // Adjust this scaling factor as needed

  // Add routers, switches, and firewalls at different positions
  this.obstacles
    .create(300, 300, "router")
    .setScale(obstacleScale)
    .refreshBody();
  this.obstacles
    .create(700, 500, "switch")
    .setScale(obstacleScale)
    .refreshBody();
  this.obstacles
    .create(400, 700, "switch")
    .setScale(obstacleScale)
    .refreshBody();

  // Enable collision between defender and obstacles
  this.physics.add.collider(this.defender, this.obstacles);

  // Variable to track if the player is near an obstacle
  this.nearObstacle = false;
  this.currentObstacleType = ""; // To track the type of obstacle we're near
  this.interactionText = this.add.text(
    this.scale.width / 2,
    this.scale.height - 40,
    "",
    { fontSize: "24px", fill: "#ffffff" }
  );
  this.interactionText.setOrigin(0.5);

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
    .text(this.scale.width / 2, this.scale.height / 2, "", {
      fontSize: "32px",
      fill: "#ffffff",
      align: "center",
    })
    .setOrigin(0.5)
    .setVisible(false);
}

function update() {
  // Reset defender velocity
  this.defender.body.setVelocity(0);

  // WASD movement controls
  if (this.keys.a.isDown) {
    this.defender.body.setVelocityX(-250);
    this.defender.flipX = true;
  } else if (this.keys.d.isDown) {
    this.defender.body.setVelocityX(250);
    this.defender.flipX = false;
  }

  if (this.keys.w.isDown) {
    this.defender.body.setVelocityY(-250);
  } else if (this.keys.s.isDown) {
    this.defender.body.setVelocityY(250);
  }

  // Check for proximity to obstacles and determine the type of obstacle
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

      // Determine the type of obstacle
      if (obstacle.texture.key === "router") {
        this.currentObstacleType = "Router";
      } else if (obstacle.texture.key === "switch") {
        this.currentObstacleType = "Switch";
      } else if (obstacle.texture.key === "firewall") {
        this.currentObstacleType = "Firewall";
      }
    }
  });

  // Display interaction prompt if near an obstacle
  if (this.nearObstacle && !this.menuActive) {
    this.interactionText.setText(
      `Near ${this.currentObstacleType}\nPress Spacebar to Interact`
    );
  } else {
    this.interactionText.setText("");
  }

  // Show the context-specific menu when spacebar is pressed near an obstacle
  if (Phaser.Input.Keyboard.JustDown(this.keys.space) && this.nearObstacle) {
    this.menuActive = true;
    this.menuBackground.setVisible(true);

    // Set menu text based on the obstacle type
    if (this.currentObstacleType === "Router") {
      this.menuText.setText(
        "Router Menu\n(Configure Router)\nPress ESC to Exit"
      );
    } else if (this.currentObstacleType === "Switch") {
      this.menuText.setText(
        "Switch Menu\n(Configure Switch)\nPress ESC to Exit"
      );
    } else if (this.currentObstacleType === "Firewall") {
      this.menuText.setText(
        "Firewall Menu\n(Configure Firewall)\nPress ESC to Exit"
      );
    }

    this.menuText.setVisible(true);
    this.defender.body.setVelocity(0); // Stop the player while the menu is active
  }

  // Close the menu when ESC is pressed
  if (Phaser.Input.Keyboard.JustDown(this.keys.esc) && this.menuActive) {
    this.menuActive = false;
    this.menuBackground.setVisible(false);
    this.menuText.setVisible(false);
  }
}
