class UiButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, key, hoverKey, text, targetCallBack) {
    super(scene, x, y);

    this.scene = scene; // the scene this container will be added to
    this.x = x; // the x position of our container
    this.y = y; // the y position of our container
    this.key = key; // the background image of our button
    this.hoverKey = hoverKey; // the image that will be displayed on hover
    this.text = text; // the text that will be dsiplayed on the button
    this.targetCallBack = targetCallBack; // the call back function that will be called when the player clicks on the button

    this.createButton();

    this.scene.add.existing(this);
  }

  createButton() {
    // Create Game Start Button
    this.button = this.scene.add.image(0, 0, "button1"); // positioned relative to the container

    // Adding Hover effect by transitioning to another button
    this.button.setInteractive();

    // scale the button
    this.button.setScale(1.4);

    // Text for button
    this.buttontext = this.scene.add.text(0, 0, this.text, {
      fontSize: "26px",
      fill: "#fff",
    });
    // Putting text inside button
    Phaser.Display.Align.In.Center(this.buttontext, this.button);

    // add two game objects to our container
    this.add(this.button);
    this.add(this.buttontext);

    //listen for events
    this.button.on("pointerdown", () => {
      this.targetCallBack();
    });

    this.button.on("pointerover", () => {
      this.button.setTexture(this.hoverKey);
    });

    this.button.on("pointerout", () => {
      this.button.setTexture(this.key);
    });
  }
}
