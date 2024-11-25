class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }

  create() {
    // Audio
    this.titleTrack = this.sound.add("titleTrack", {
      loop: true,
      volume: 0.5,
    });

    this.titleTrack.play();

    this.clickSound = this.sound.add("clickSound", {
      loop: false,
      volume: 0.8,
    });

    // Add Title Background
    this.titleBackground = this.add.image(0, 0, "titleBackground");
    this.titleBackground.setOrigin(0, 0);
    // Scale the background to fit the screen size
    this.titleBackground.displayWidth = this.scale.width;
    this.titleBackground.displayHeight = this.scale.height;

    // Create Title Text
    this.titleText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "Network Defender",
      {
        fontSize: "64px",
        fill: "#ffffff",
        stroke: "#000000", // Black stroke around the text
        strokeThickness: 6,
      }
    );
    this.titleText.setOrigin(0.5);

    // create game start button
    this.startGameButton = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.65,
      "button1",
      "button2",
      "Start",
      () => {
        this.clickSound.play(); // Play the sound
        this.titleTrack.stop();
        this.startScene("Game"); // Start the game scene
      }
    );
  }

  startScene(targetScene) {
    this.scene.start(targetScene);
  }
}
