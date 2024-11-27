class MessageHandler {
  constructor(scene) {
    this.scene = scene;
    this.menuActive = false;
    this.lastMessage = null;
    this.userMessage = "";
    this.currentEncryptIndex = 0;
    this.menuBackground = null;
    this.menuText = null;
    this.messageInput = null;
    this.avatar = null;
    this.receiverAvatar = null; // Define receiver avatar object
    this.aiFeedbackText = null; // To display AI feedback
    this.isEncrypted = false; // To track if the message has been encrypted
  }

  initialize() {
    this.avatar = this.scene.add.sprite(200, 300, 'avatarImageKey');
    this.receiverAvatar = this.scene.add.sprite(600, 300, 'receiverAvatarImageKey'); // Example position for receiver avatar

    // Listen for 'E' key press to open the popup menu
    this.scene.input.keyboard.on("keydown-E", () => {
      this.openMessagePopup();
    });
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
        ? "Press arrows to encrypt the message:"
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

      this.scene.input.keyboard.on("keydown", (event) => {
        if (this.menuActive) {
          if (!this.lastMessage) {
            // Message typing
            if (event.key === "Backspace") {
              this.userMessage = this.userMessage.slice(0, -1);
            } else if (event.key.length === 1 && event.key.match(/[a-zA-Z0-9 ]/)) {
              this.userMessage += event.key;
            } else if (event.key === "Enter") {
              this.lastMessage = this.userMessage;
              this.menuActive = false;
              this.displaySpeechBubble(this.userMessage);  // Show speech bubble after message is entered
              this.closePopup();
            }
            this.messageInput.setText(this.userMessage + "_");
          } else {
            // Encrypting step
            this.handleManualEncryption(event);
          }
        }
      });
    }
  }

  displaySpeechBubble(message) {
    if (this.avatar) {
      if (this.speechBubble) {
        this.speechBubble.destroy();
      }

      this.speechBubble = this.scene.add.text(
        this.avatar.x,
        this.avatar.y - 50,
        message,
        {
          fontSize: "18px",
          fill: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 },
        }
      ).setOrigin(0.5);
    }
  }

  closePopup() {
    this.menuBackground.destroy();
    this.menuText.destroy();
    this.messageInput.destroy();
  }

  promptForEncryption() {
    this.menuText.setText("Press arrows to adjust encryption.");
    this.currentEncryptIndex = 0;
    this.messageInput.setText(this.userMessage);
  }

  handleManualEncryption(event) {
    const currentChar = this.userMessage[this.currentEncryptIndex];
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      this.userMessage =
        this.userMessage.substring(0, this.currentEncryptIndex) +
        this.shiftCharacter(currentChar, event.key === "ArrowUp" ? -3 : 3) +
        this.userMessage.substring(this.currentEncryptIndex + 1);
    } else if (event.key === "ArrowRight") {
      this.currentEncryptIndex = (this.currentEncryptIndex + 1) % this.userMessage.length;
    } else if (event.key === "ArrowLeft") {
      this.currentEncryptIndex =
        (this.currentEncryptIndex - 1 + this.userMessage.length) % this.userMessage.length;
    } else if (event.key === "Enter") {
      // Finish encryption
      this.lastMessage = this.userMessage;
      this.isEncrypted = true; // Mark encryption as done
      this.menuActive = false;
      this.displaySpeechBubble(this.userMessage);
      this.closePopup();
      this.launchPacket(); // Launch the packet to receiver
      this.evaluateEncryption(); // Trigger evaluation after encryption
    }
    this.messageInput.setText(this.userMessage);
  }

  shiftCharacter(char, shift) {
    if (/[a-zA-Z]/.test(char)) {
      const isUpperCase = char === char.toUpperCase();
      const base = isUpperCase ? 65 : 97;
      return String.fromCharCode(
        ((char.charCodeAt(0) - base + shift + 26) % 26) + base
      );
    }
    return char;
  }

  evaluateEncryption() {
    // Ensure encryption is complete
    if (!this.isEncrypted) return;

    // Example of how the evaluation might be done (using Caesar cipher with a shift of 3)
    const correctEncryptedMessage = this.caesarCipher(this.lastMessage, 3);
    let score = 0;

    // Compare user encrypted message to the correct encrypted version
    for (let i = 0; i < this.lastMessage.length; i++) {
      if (this.lastMessage[i] === correctEncryptedMessage[i]) {
        score++;
      }
    }

    this.provideAIFeedback(score); // Provide feedback based on the score
  }

  caesarCipher(message, shift) {
    return message
      .split("")
      .map((char) => this.shiftCharacter(char, shift))
      .join("");
  }

  provideAIFeedback(score) {
    // Clear previous feedback
    if (this.aiFeedbackText) {
      this.aiFeedbackText.destroy();
    }

    // Provide feedback based on score
    let feedbackMessage;
    if (score === this.lastMessage.length) {
      feedbackMessage = "Excellent encryption!";
    } else if (score > this.lastMessage.length / 2) {
      feedbackMessage = "Good attempt, but some characters need more shifting.";
    } else {
      feedbackMessage = "Encryption needs improvement. Try again!";
    }

    // Display feedback message
    this.aiFeedbackText = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2 + 50,
      feedbackMessage,
      {
        fontSize: "20px",
        fill: "#ffffff",
        align: "center",
      }
    ).setOrigin(0.5);
  }

  showReceiverSpeechBubble(message) {
    if (this.receiverAvatar) {
      if (this.receiverSpeechBubble) {
        this.receiverSpeechBubble.destroy();
      }

      // Display receiver speech bubble
      this.receiverSpeechBubble = this.scene.add.text(
        this.receiverAvatar.x,
        this.receiverAvatar.y - 50,
        message,
        {
          fontSize: "18px",
          fill: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 },
        }
      ).setOrigin(0.5);
    }
  }

  launchPacket() {
    // Show message in receiver's speech bubble
    this.showReceiverSpeechBubble(this.lastMessage);
  }
}
