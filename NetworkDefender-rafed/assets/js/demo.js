const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

class Demo extends Phaser.Scene {
  constructor() {
    super({
      key: "examples",
    });

    // Variable to store the input text
    this.inputValue = "";
  }

  preload() {
    this.load.plugin(
      "rexinputtextplugin",
      "assets/plugins/inputPlugin.js",
      true
    );
  }

  create() {
    var printText = this.add
      .text(400, 200, "", {
        fontSize: "12px",
      })
      .setOrigin(0.5)
      .setFixedSize(100, 100);

    // Store inputText as a class property
    this.inputText = this.add
      .rexInputText(400, 400, 10, 10, {
        type: "textarea",
        text: "hello world",
        fontSize: "12px",
      })
      .resize(100, 100)
      .setOrigin(0.5);

    // Initial setup for printText
    this.inputValue = this.inputText.text; // Store initial text
    printText.text = this.inputValue;

    this.add.text(0, 580, "Click below text to edit it");

    // Handle pointer down to blur input
    this.input.on("pointerdown", () => {
      this.inputText.setBlur();
      console.log("pointerdown outside");
    });

    // Listen for text changes and update inputValue
    this.inputText.on("textchange", (inputText) => {
      this.inputValue = inputText.text; // Update stored text
      printText.text = this.inputValue;
    });
  }

  update() {
    // Handle keyboard events directly in the update loop
    if (this.inputText.isFocused) {
      if (this.inputText.inputType !== "textarea") {
        this.inputText.on("keydown", (inputText, e) => {
          if (e.key === "Enter") {
            inputText.setBlur();
          }
        });
      }
    }
  }
}

var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true,
  },
  scene: Demo,
};

var game = new Phaser.Game(config);
