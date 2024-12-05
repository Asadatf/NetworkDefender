class MessageHandler {
  constructor(scene, packet, red_briefcase, dX, dY, rX, rY) {
    this.dX = dX;
    this.dY = dY;
    this.rX = rX;
    this.rY = rY;
    this.red_briefcase = red_briefcase;
    this.scene = scene;
    this.lastMessage = "";
    this.menuActive = false;
    this.packetTween = null;
    this.packet = packet;
    this.currentEncryptIndex = 0;
    this.aiFeedbackText = null;
    this.isEncrypted = false;
    this.isEncrypting = false;
    this.keydownListener = null;
    this.wallet = 10;
    this.selectedWords = [];
    this.wordTextObjects = [];
    this.tokenizedMessage = [];
  }

  openMessagePopup() {
    if (!this.menuActive) {
      this.menuActive = true;

      // Popup Menu setup
      this.menuBackground = this.scene.add.rectangle(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        400,
        300,
        0x000000,
        0.7
      );

      let promptText = this.lastMessage
        ? "Use arrow keys to select words to encrypt:"
        : "Write your message:";
      this.menuText = this.scene.add
        .text(
          this.scene.scale.width / 2,
          this.scene.scale.height / 2 - 100,
          promptText,
          {
            fontSize: "24px",
            fill: "#ffffff",
            align: "center",
          }
        )
        .setOrigin(0.5);

      this.messageInput = this.scene.add
        .text(this.scene.scale.width / 2, this.scene.scale.height / 2, "_", {
          fontSize: "20px",
          fill: "#ffffff",
        })
        .setOrigin(0.5);

      if (!this.lastMessage) {
        this.userMessage = ""; // New message entry
      } else {
        this.userMessage = this.lastMessage; // For encryption
      }

      // Remove previous keydown listener if exists
      if (this.keydownListener) {
        this.scene.input.keyboard.off("keydown", this.keydownListener);
      }

      this.keydownListener = (event) => {
        if (this.menuActive) {
          if (!this.lastMessage) {
            // Message typing logic
            if (event.key === "Backspace") {
              this.userMessage = this.userMessage.slice(0, -1);
            } else if (
              event.key.length === 1 &&
              /[a-zA-Z0-9 ]/.test(event.key)
            ) {
              this.userMessage += event.key;
            } else if (event.key === "Enter") {
              this.lastMessage = this.userMessage;
              this.menuActive = false;

              this.displaySpeechBubble(this.dX, this.dY - 50, this.userMessage);

              // Tokenize and store the message
              this.tokenizedMessage = this.userMessage.split(/\s+/);
              console.log(this.tokenizedMessage);

              this.closePopup();
            }
            this.messageInput.setText(this.userMessage + "_");
          } else {
            // Display tokenized message when re-opening menu
            this.displayTokenizedMessage(this.tokenizedMessage); // Pass tokenized message as parameter
            // Handle encryption logic
            this.handleManualEncryption(event);
          }
        }
      };

      // Attach the new listener
      this.scene.input.keyboard.on("keydown", this.keydownListener);
    }
  }

  displaySpeechBubble(x, y, message) {
    // Create a speech bubble at the given coordinates
    const speechBubble = this.scene.add.image(x, y - 50, "Popup");
    speechBubble.setOrigin(0.5);
    speechBubble.setScale(1).setDepth(1);

    const bubbleWidth = speechBubble.width * speechBubble.scaleX - 20;

    // Add the user's message inside the bubble
    const bubbleText = this.scene.add
      .text(x, y, message, {
        fontSize: "18px",
        fill: "#000000",
        wordWrap: { width: bubbleWidth, useAdvancedWrap: true },
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setAlpha(0);

    Phaser.Display.Align.In.Center(bubbleText, speechBubble);

    speechBubble.setAlpha(0);

    // Add fade-in animation
    this.scene.tweens.add({
      targets: [speechBubble, bubbleText],
      alpha: 1,
      duration: 500,
      ease: "Power2",
    });

    this.scene.time.delayedCall(3000, () => {
      bubbleText.destroy();
      speechBubble.destroy();
    });
  }

  closePopup() {
    this.menuBackground.destroy();
    this.menuText.destroy();
    this.messageInput.destroy();
  }

  displayTokenizedMessage(tokenizedMessage) {
    this.wordTextObjects.forEach((wordText) => wordText.destroy()); // Clear previous words
    this.wordTextObjects = tokenizedMessage.map((word, index) => {
      const wordText = this.scene.add
        .text(
          100 + index * 100, // Adjust x-coordinate for each word
          200, // y-coordinate
          word,
          { font: "16px Arial", fill: "#fff" }
        )
        .setDepth(2);

      wordText.setInteractive(); // Make words clickable
      wordText.on("pointerdown", () => this.handleWordClick(index)); // Handle click

      return wordText;
    });
  }

  handleWordClick(index) {
    if (this.selectedWords.length < 2) {
      const selectedWord = this.tokenizedMessage[index];
      this.selectedWords.push(selectedWord);
      console.log("Selected word:", selectedWord);

      if (this.selectedWords.length === 2) {
        console.log("Ready to encrypt:", this.selectedWords);
        this.isEncrypting = true;
      }

      this.highlightSelectedWord(index); // Optional: Highlight selected word
    }
  }

  handleManualEncryption(event) {
    if (this.selectedWords.length < 2) {
      if (event.key === "ArrowRight") {
        this.currentEncryptIndex =
          (this.currentEncryptIndex + 1) % this.tokenizedMessage.length;
      } else if (event.key === "ArrowLeft") {
        this.currentEncryptIndex =
          (this.currentEncryptIndex - 1 + this.tokenizedMessage.length) %
          this.tokenizedMessage.length;
      } else if (event.key === "Enter") {
        this.selectedWords.push(
          this.tokenizedMessage[this.currentEncryptIndex]
        );
        if (this.selectedWords.length === 2) {
          this.isEncrypting = true;
        }
        this.highlightSelectedWord();
      }
    }
  }

  highlightSelectedWord() {
    const word = this.tokenizedMessage[this.currentEncryptIndex];
    this.menuText.setText(`Currently selecting: ${word}`);
  }

  closeEncryptionMenu() {
    this.isEncrypting = false;
    this.selectedWords = [];
    this.wordTextObjects.forEach((wordText) => wordText.destroy()); // Clear words
    this.menuText.setText("Encryption complete!");
  }
}
