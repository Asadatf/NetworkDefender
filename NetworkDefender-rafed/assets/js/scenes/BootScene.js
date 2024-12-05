class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    // load images
    this.loadImages();

    // load spritesheet
    this.loadspritesheet();

    // load Audio
    this.loadAudio();
  }

  loadImages() {
    this.load.image("titleBackground", "assets/images/titleBackground.jpeg");
    this.load.image("background", "assets/images/background.jpeg");
    this.load.image("defender", "assets/images/defender.png");
    this.load.image("receiver", "assets/images/receiver.png");
    this.load.image("attacker", "assets/images/attacker.png");
    this.load.image("router", "assets/images/router.png");
    this.load.image("switch", "assets/images/switch.png");
    this.load.image("packet", "assets/images/packet.png");
    this.load.image("messageBox", "assets/images/message_box.png");
    this.load.image("Popup", "assets/images/Popup.png");
    this.load.plugin(
      "rexinputtextplugin",
      "assets/plugins/inputPlugin.js",
      true
    );

    // UI Buttons
    this.load.image("button1", "assets/images/ui/blue_button01.png");
    this.load.image("button2", "assets/images/ui/blue_button02.png");
  }

  loadspritesheet() {
    this.load.spritesheet("briefcase", "assets/images/briefcase.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
  }

  loadAudio() {
    this.load.audio("clickSound", ["assets/audio/clickSound.mp3"]);
    this.load.audio("titleTrack", ["assets/audio/titleTrack.mp3"]);
  }

  create() {
    console.log("Starting Game");

    this.scene.start("Title");
  }
}
