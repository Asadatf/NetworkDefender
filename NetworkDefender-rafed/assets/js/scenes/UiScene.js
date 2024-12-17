class UiScene extends Phaser.Scene {
  constructor() {
    super("Ui");
  }

  init() {
    // grab a reference to the game scene
    this.gameScene = this.scene.get("Game");
  }

  create() {
    this.setupUiElements();
    // this.setUpEvents();
  }

  setupUiElements() {
    //Create the store text game object
    // this.scoretext = this.add.text(35, 8, "Score: 0", {
    //   fontSize: "32px",
    //   fill: "#fff",
    // });
  }

  //   setUpEvents() {
  //     this.gameScene.events.on("updateScore", (score) => {
  //       this.scoretext.setText(`Coins: ${score}`);
  //     });
  //   }
}
