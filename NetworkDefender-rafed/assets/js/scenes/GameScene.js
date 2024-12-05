class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  init() {
    // Text setup for interaction prompt
    this.interactText = this.add
      .text(window.innerWidth / 2, window.innerHeight / 2, "", {
        fontSize: "24px",
        fill: "#ffffff",
      })
      .setOrigin(0.5, 0)
      .setDepth(1)
      .setVisible(false);
    this.scene.launch("Ui");
  }

  create() {
    // Add background
    this.background = this.add.image(0, 0, "background");
    this.background.setOrigin(0, 0);
    // Scale the background to fit the screen size
    this.background.displayWidth = this.scale.width;
    this.background.displayHeight = this.scale.height;

    // Creating Defender
    const dX = window.innerWidth / 4;
    const dY = 300;

    this.defender = new Defender(this, dX - 100, dY, "defender");

    // Creating Receiver
    const rX = (window.innerWidth * 3) / 4;
    const rY = 300;

    this.receiver = new Receiver(this, rX + 50, rY, "receiver");

    // Creating Network Devices
    this.obstacles = this.physics.add.staticGroup();

    this.leftSwitch = new NetworkDevice(this, dX, dY, "switch");
    this.obstacles.add(this.leftSwitch);

    this.rightSwitch = new NetworkDevice(this, rX, rY, "switch");
    this.obstacles.add(this.rightSwitch);

    this.physics.add.collider(this.defender, this.obstacles);

    // Creating Packet
    this.packet = new Packet(
      this,
      this.defender.x + 10,
      this.defender.y,
      "packet"
    );

    // Creating briefcase for encryption
    this.briefcase_red = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2,
      "briefcase"
    );
    this.briefcase_red.setScale(2).setDepth(1).setVisible(false);

    // Message handler
    this.MessageHandler = new MessageHandler(
      this,
      this.packet,
      this.briefcase_red,
      dX,
      dY,
      rX,
      rY
    );

    // Creating Controll Keys
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

  update() {
    this.defender.update(this.keys, this.MessageHandler.menuActive);

    this.nearObstacle = false;
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

    if (this.nearObstacle && !this.MessageHandler.menuActive) {
      this.interactText.setText("Press E to Interact").setVisible(true);
    } else {
      this.interactText.setVisible(false);
    }

    // Show the context-specific menu when spacebar is pressed near an obstacle
    if (this.keys.e.isDown && this.nearObstacle) {
      this.nearObstacle = false;
      this.MessageHandler.openMessagePopup();
    }
  }
}
