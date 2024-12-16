class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  init() {
    // Text setup for interaction prompt
    this.interactText = this.add
      .text(window.innerWidth / 2, window.innerHeight / 2, "", {
        fontSize: "24px",
        fill: "#00ff00",
        fontFamily: "Courier New",
        stroke: "#003300",
        strokeThickness: 2,
        shadow: { color: "#00ff00", blur: 10, fill: true }
      })
      .setOrigin(0.5, 0)
      .setDepth(1)
      .setVisible(false);
    this.scene.launch("Ui");
  }

  create() {

    //Add background
    this.background = this.add.image(0, 0, "background");
    this.background.setOrigin(0, 0);
    // Scale the background to fit the screen size
    this.background.displayWidth = this.scale.width;
    this.background.displayHeight = this.scale.height;

    this.createVisualEffects();

    // Creating Defender
    const dX = window.innerWidth / 4;
    const dY = 300;

    this.defender = new Defender(this, dX - 100, dY, "defender");
    this.addGlowEffect(this.defender);

    // Creating Receiver
    const rX = (window.innerWidth * 3) / 4;
    const rY = 300;

    this.receiver = new Receiver(this, rX + 50, rY, "receiver");
    this.addGlowEffect(this.defender);

    // Creating Network Devices
    this.obstacles = this.physics.add.staticGroup();

    this.leftSwitch = new NetworkDevice(this, dX, dY, "switch");
    this.obstacles.add(this.leftSwitch);

    this.rightSwitch = new NetworkDevice(this, rX, rY, "switch");
    this.obstacles.add(this.rightSwitch);

    [this.leftSwitch, this.rightSwitch].forEach(device => {
      this.addGlowEffect(device);
      this.obstacles.add(device);
    });

    // Add connection lines between devices
    this.createNetworkConnections();

    this.physics.add.collider(this.defender, this.obstacles);

    // Initialize NetworkPathManager with obstacles group
    this.pathManager = new NetworkPathManager(this, this.obstacles);
    this.pathManager.initializeNetworkTopology();

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

    this.Encryptiontutorial = new EncryptionTutorial(this);

    // Message handler
    this.MessageHandler = new MessageHandler(
      this,
      this.packet,
      this.briefcase_red,
      dX,
      dY,
      rX,
      rY,
      this.Encryptiontutorial
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

    Object.keys(this.keys).forEach(key => {
      this.keys[key].on('down', () => this.createKeyPressEffect(key));
    });
  }

  createKeyPressEffect(key) {
    const keyText = this.add.text(
      this.scale.width - 100,
      this.scale.height - 50,
      key.toUpperCase(),
      {
        fontSize: '24px',
        fill: '#00ff00',
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: keyText,
      alpha: 0,
      y: this.scale.height - 70,
      duration: 500,
      onComplete: () => keyText.destroy()
    });
  }

  createCyberBackground() {
    // Create a dark background
    this.background = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x001a1a);
    this.background.setOrigin(0, 0);

    // Add animated grid lines
    this.gridGraphics = this.add.graphics();
    this.gridGraphics.lineStyle(1, 0x00ff00, 0.3);

    // Create vertical lines
    for (let x = 0; x < this.scale.width; x += 50) {
      this.gridGraphics.moveTo(x, 0);
      this.gridGraphics.lineTo(x, this.scale.height);
    }

    // Create horizontal lines
    for (let y = 0; y < this.scale.height; y += 50) {
      this.gridGraphics.moveTo(0, y);
      this.gridGraphics.lineTo(this.scale.width, y);
    }

    // Animate grid opacity
    this.tweens.add({
      targets: this.gridGraphics,
      alpha: 0.1,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
  }

  createVisualEffects() {
    // Create a group for packet trail effects
    this.packetTrail = this.add.group();
    
    // Setup packet trail effect
    this.time.addEvent({
      delay: 100,
      callback: this.createPacketTrail,
      callbackScope: this,
      loop: true
    });
  }
  createPacketTrail() {
    if (this.packet && this.packet.visible) {
      const trail = this.add.circle(
        this.packet.x,
        this.packet.y,
        3,
        0x00ff00,
        0.7
      );

      this.packetTrail.add(trail);

      this.tweens.add({
        targets: trail,
        alpha: 0,
        scale: 0.1,
        duration: 500,
        onComplete: () => {
          trail.destroy();
        }
      });
    }
  }
  addGlowEffect(gameObject) {
    const glowGraphics = this.add.graphics();
    const glowColor = 0x00ff00;
    
    this.tweens.add({
      targets: glowGraphics,
      alpha: { from: 0.5, to: 0.2 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      onUpdate: () => {
        glowGraphics.clear();
        glowGraphics.lineStyle(2, glowColor, glowGraphics.alpha);
        glowGraphics.strokeCircle(
          gameObject.x, 
          gameObject.y, 
          gameObject.displayWidth * 0.6
        );
      }
    });
  }
  createNetworkConnections() {
    this.connectionGraphics = this.add.graphics();
    
    this.time.addEvent({
      delay: 50,
      callback: this.updateNetworkConnections,
      callbackScope: this,
      loop: true
    });
  }

  updateNetworkConnections() {
    // Only draw connection if path is valid (both IPs configured)
    if (this.pathManager && this.pathManager.isPathValid()) {
      this.connectionGraphics.clear();
      this.connectionGraphics.lineStyle(2, 0x00ff00, 0.5);
      
      const progress = (Date.now() % 2000) / 2000;
      
      this.drawAnimatedConnection(
        this.connectionGraphics,
        this.leftSwitch.x,
        this.leftSwitch.y,
        this.rightSwitch.x,
        this.rightSwitch.y,
        progress
      );
    } else {
      // Clear any existing connection if path becomes invalid
      this.connectionGraphics.clear();
    }
  }
  drawAnimatedConnection(graphics, x1, y1, x2, y2, progress) {
    // Draw base line
    graphics.beginPath();
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
    graphics.strokePath();

    // Draw moving data packets
    const dotCount = 3;
    for (let i = 0; i < dotCount; i++) {
      const dotProgress = (progress + (i / dotCount)) % 1;
      const dotX = x1 + (x2 - x1) * dotProgress;
      const dotY = y1 + (y2 - y1) * dotProgress;
      
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillCircle(dotX, dotY, 3);
    }
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

    if (
      this.nearObstacle &&
      !this.MessageHandler.menuActive &&
      this.pathManager.isPathValid()
    ) {
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
