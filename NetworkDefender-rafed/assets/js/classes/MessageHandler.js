class MessageHandler {
  constructor(scene, packet, dX, dY, rX, rY) {
    this.dX = dX;
    this.dY = dY;
    this.rX = rX;
    this.rY = rY;
    this.scene = scene; // Reference to the GameScene
    this.lastMessage = ""; // Store the last submitted message
    this.menuActive = false; // Track if the menu is active
    this.packetTween = null;
    this.packet = packet;
  }

  openMessagePopup() {
    if (!this.menuActive) {
      this.menuActive = true;

      // Popup Menu
      this.menuBackground = this.scene.add.rectangle(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        400,
        300,
        0x000000,
        0.7
      );
      this.menuText = this.scene.add
        .text(
          this.scene.scale.width / 2,
          this.scene.scale.height / 2 - 50,
          "Write your message:",
          {
            fontSize: "32px",
            fill: "#ffffff",
            align: "center",
          }
        )
        .setOrigin(0.5);

      // this.userMessage = "";

      // Initialize message input
      this.messageInput = this.scene.add
        .text(this.scene.scale.width / 2, this.scene.scale.height / 2, "_", {
          fontSize: "24px",
          fill: "#ffffff",
        })
        .setOrigin(0.5);

      // Variable to hold the user's typed message
      this.userMessage = ""; // If there's already a message, start with it

      // Listen for keyboard input to update the typed message
      this.scene.input.keyboard.on("keydown", (event) => {
        if (this.menuActive) {
          // Handle backspace (delete last character)
          if (event.key === "Backspace") {
            this.userMessage = this.userMessage.slice(0, -1);
          } else if (event.key.length === 1 && event.key.match(/[a-zAZ0-9 ]/)) {
            this.userMessage += event.key;
          } else if (event.key === "Enter") {
            // Submit the message when Enter is pressed
            this.lastMessage = this.userMessage; // Store the message persistently
            console.log("Message submitted:", this.lastMessage);

            this.encryptedSentence = this.randomCaesarCipher(this.lastMessage);

            this.displaySpeechBubble(
              this.dX,
              this.dY - 50,
              this.encryptedSentence
            );

            this.launchPacket();

            // Close the popup
            this.menuBackground.destroy();
            this.menuText.destroy();
            this.messageInput.destroy();
            this.menuActive = false;
          }

          // Update the message input text in the popup
          this.messageInput.setText(this.userMessage + "_");
        }
      });
    }
  }

  displaySpeechBubble(x, y, message) {
    // Create a speech bubble at the given coordinates
    // const speechBubble = this.add.image(x, y, "speechBubble");
    // speechBubble.setOrigin(0.5);
    // speechBubble.setScale(0.5);

    // Add the user's message inside the bubble
    const bubbleText = this.scene.add
      .text(x, y, message, {
        fontSize: "18px",
        fill: "#000000",
        wordWrap: { width: 250, useAdvancedWrap: true },
      })
      .setOrigin(0.5);

    // Optionally, you can add an animation or movement to make the speech bubble appear more dynamic.
    // For example, make the speech bubble pop up or appear with a slight delay.

    // Set a timer to automatically remove the speech bubble after some time or when the user clicks to continue.
    this.scene.time.delayedCall(3000, () => {
      // speechBubble.destroy();
      bubbleText.destroy();
    });
  }

  // displayReceivedMessage() {
  //   displaySpeechBubble.call(
  //     this.scene,
  //     this.rX,
  //     this.rY - 50,
  //     "Received: " + this.encryptedSentence
  //   );
  // }

  randomCaesarCipher(sentence) {
    console.log("Sentence Received: ", sentence);
    const shift = 3; // Shift value for the Caesar Cipher
    const words = sentence.split(" ");
    console.log("Words array:", words); // Debug: Check the words array
    console.log("Words length:", words.length);

    if (words.length > 6) {
      console.error("The sentence must have maximum of 6 words.");
      return null;
    }

    // Helper function to apply Caesar Cipher on a word
    const caesarEncrypt = (word, shift) => {
      if (!word || word.trim() === "") {
        return word; // Return the word as-is if it's empty or invalid
      }
      return word
        .split("")
        .map((char) => {
          if (/[a-zA-Z]/.test(char)) {
            const isUpperCase = char === char.toUpperCase();
            const base = isUpperCase ? 65 : 97; // ASCII codes for 'A' or 'a'
            return String.fromCharCode(
              ((char.charCodeAt(0) - base + shift) % 26) + base
            );
          }
          return char; // Non-alphabet characters remain unchanged
        })
        .join("");
    };

    // Randomly pick two unique indices from the 6 words
    let indices = [];
    while (indices.length < 2) {
      const randomIndex = Math.floor(Math.random() * 6);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }

    // Encrypt the chosen words
    indices.forEach((index) => {
      words[index] = caesarEncrypt(words[index], shift);
    });

    return words.join(" ");
  }

  launchPacket() {
    // Animate the packet from sender to receiver
    this.packetTween = this.scene.tweens.add({
      targets: this.packet,
      x: this.rX,
      y: this.rY,
      duration: 2000,
      ease: "Linear",
      onComplete: () => {
        this.displaySpeechBubble(
          this.rX,
          this.rY - 50,
          "Received: " + this.encryptedSentence
        );
      },
    });
  }
}

window.MessageHandler = MessageHandler;
