window.PRODUCTION = true;
class MessageHandler {
  constructor(
    scene,
    packet,
    red_briefcase,
    dX,
    dY,
    rX,
    rY,
    EncryptionTutorial
  ) {
    this.dX = dX;
    this.dY = dY;
    this.rX = rX;
    this.rY = rY;
    this.receiverX = rX;
    this.receiverY = rY;
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
    this.caesarShift = 3;
    this.securityScore = 0;
    this.userScore = 0;
    this.interceptAnimationGroup = null;

    this.encryptionAnalysisEndpoint = window.PRODUCTION
      ? "http://localhost:5000/analyze_encryption"
      : "http://localhost:5000/analyze_encryption";

    this.EncryptionTutorial = EncryptionTutorial;
    this.encryptionMethod = null;

    // Adding Timer Functionality
    this.encryptionTimeLimit = 10; // 30 seconds to encrypt
    this.encryptionTimer = null;
    this.timeRemainingText = null;

    // Game over vars
    this.isTerminating = false;
  }

  showEncryptionMethodSelection() {
    // Close any existing popups first
    this.closePopup();

    // Create a new popup specifically for encryption method selection
    this.menuBackground = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      500, // Increased width
      400, // Increased height
      0x000000,
      0.8
    );

    const titleText = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2 - 150,
        "Choose Encryption Method",
        {
          fontSize: "24px",
          fill: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Automatic Encryption Button
    const autoEncryptButton = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2 - 50,
        "Automatic Encryption",
        {
          fontSize: "20px",
          fill: "#00ff00",
          backgroundColor: "#004400",
          padding: 10,
        }
      )
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => {
        this.closePopup(); // Close the method selection popup
        this.isEncrypting = true;
        this.encryptionMethod = "automatic"; // Store the chosen method

        // Use a separate method for automatic encryption
        this.performAutomaticEncryption();
      });

    // Manual Encryption Button
    const manualEncryptButton = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2 + 50,
        "Manual Encryption",
        {
          fontSize: "20px",
          fill: "#0000ff",
          backgroundColor: "#000044",
          padding: 10,
        }
      )
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => {
        this.closePopup();
        this.isEncrypting = true;
        this.encryptionMethod = "manual"; // Store the chosen method

        // Open encryption tutorial with the first selected word
        this.openEncryptionTutorial(this.selectedWords[0]);
      });

    // Store these elements for potential cleanup
    this.menuElements = [
      this.menuBackground,
      titleText,
      autoEncryptButton,
      manualEncryptButton,
    ];

    this.startEncryptionTimer();
  }

  performAutomaticEncryption() {
    // Ensure we have two words selected
    if (this.selectedWords.length !== 2) {
      console.error("Not enough words selected for encryption");
      return;
    }

    // Create a separate popup for automatic encryption progress
    this.menuBackground = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      500,
      300,
      0x000000,
      0.8
    );

    const progressText = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        "Performing Automatic Encryption...",
        {
          fontSize: "24px",
          fill: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5);

    this.menuElements = [this.menuBackground, progressText];

    // Trigger the Caesar cipher encryption animation
    this.animateCaesarCipherEncryption();
  }

  async performAdvancedEncryptionAnalysis(originalMessage, encryptedMessage) {
    try {
      const response = await fetch(this.encryptionAnalysisEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          original_message: originalMessage,
          encrypted_message: encryptedMessage,
          encryption_method: "caesar_cipher",
        }),
      });

      // Enhanced error handling
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        this.processEncryptionAnalysis(result);
      } else {
        console.error("Encryption analysis failed", result.error);
      }
    } catch (error) {
      console.error("Network or analysis error:", error);
      // Fallback to local scoring method
      this.fallbackLocalScoring(originalMessage, encryptedMessage);
    }
  }

  fallbackLocalScoring(originalMessage, encryptedMessage) {
    console.log("Original Message:", originalMessage);
    console.log("Encrypted Message:", encryptedMessage);

    const localScore = this.calculateLocalEncryptionScore(
      originalMessage,
      encryptedMessage
    );

    console.log("Calculated Local Score:", localScore);

    this.displayLocalEncryptionFeedback(localScore);
  }

  displayReceiverEncryptedMessage() {
    // Verify we have an encrypted message to display
    if (!this.encryptedMessage) {
      console.warn("No encrypted message to display");
      return;
    }

    // Display speech bubble with encrypted message at receiver's switch
    const speechBubble = this.scene.add.image(
      this.receiverX,
      this.receiverY - 50,
      "Popup"
    );
    speechBubble.setOrigin(0.5);
    speechBubble.setScale(1).setDepth(1);

    const bubbleWidth = speechBubble.width * speechBubble.scaleX - 20;

    // Add encrypted message text inside the bubble
    const bubbleText = this.scene.add
      .text(this.receiverX, this.receiverY, this.encryptedMessage, {
        fontSize: "18px",
        fill: "#000000",
        wordWrap: { width: bubbleWidth, useAdvancedWrap: true },
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setAlpha(0);

    Phaser.Display.Align.In.Center(bubbleText, speechBubble);

    speechBubble.setAlpha(0);

    // Add fade-in animation for the encrypted message
    this.scene.tweens.add({
      targets: [speechBubble, bubbleText],
      alpha: 1,
      duration: 500,
      ease: "Power2",
    });

    // Automatically remove the speech bubble after a delay
    this.scene.time.delayedCall(3000, () => {
      this.scene.tweens.add({
        targets: [speechBubble, bubbleText],
        alpha: 0,
        duration: 500,
        ease: "Power2",
        onComplete: () => {
          bubbleText.destroy();
          speechBubble.destroy();
        },
      });
    });
  }

  caesarCipherEncrypt(text, shift) {
    return text
      .split("")
      .map((char) => {
        // Only encrypt alphabetic characters
        if (char.match(/[a-zA-Z]/)) {
          // Determine the base (uppercase or lowercase)
          const base =
            char.toLowerCase() === char ? "a".charCodeAt(0) : "A".charCodeAt(0);

          // Apply Caesar cipher shift
          return String.fromCharCode(
            ((char.charCodeAt(0) - base + shift + 26) % 26) + base
          );
        }
        // Return non-alphabetic characters as-is
        return char;
      })
      .join("");
  }

  animateCaesarCipherEncryption() {
    if (!this.isEncrypting || this.selectedWords.length !== 2) return;

    // Remove the previous popup first
    this.closePopup();

    // Ensure word text objects are visible
    this.wordTextObjects.forEach((wordText) => {
      wordText.setVisible(true);
      wordText.setAlpha(1);
    });

    // Find the indices of the selected words
    const wordIndices = this.selectedWords.map((word) =>
      this.tokenizedMessage.indexOf(word)
    );

    // Create encryption animation
    wordIndices.forEach((wordIndex) => {
      const originalWord = this.tokenizedMessage[wordIndex];
      const encryptedWord = this.caesarCipherEncrypt(
        originalWord,
        this.caesarShift
      );

      // Animate word transformation
      const wordText = this.wordTextObjects[wordIndex];

      // Create a tween to animate the word encryption
      this.scene.tweens.add({
        targets: wordText,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 500,
        yoyo: true,
        ease: "Quad.easeInOut",
        onUpdate: (tween) => {
          const progress = tween.getValue();
          // Interpolate between original and encrypted word
          const currentWord = this.interpolateWord(
            originalWord,
            encryptedWord,
            progress
          );
          wordText.setText(currentWord);
        },
        onComplete: () => {
          // Set final encrypted word
          wordText.setText(encryptedWord);
          wordText.setBackgroundColor("#ff0000"); // Red to indicate encryption
          this.updateEncryptedMessage(encryptedWord, wordIndex);
        },
      });
    });

    // Close encryption menu after animation
    this.scene.time.delayedCall(1500, () => {
      this.closeEncryptionMenu();
      this.launchEncryptedPacket();
    });
  }

  updateEncryptedMessage(encryptedWord, wordIndex) {
    // Replace the original word with its encrypted version in the tokenized message
    this.tokenizedMessage[wordIndex] = encryptedWord;

    // Reconstruct the full encrypted message
    this.encryptedMessage = this.tokenizedMessage.join(" ");
    console.log("Full Encrypted Message:", this.encryptedMessage);
  }

  launchEncryptedPacket() {
    // Stopping Timer wg=hen packet is launched
    if (this.encryptionTimer) {
      this.encryptionTimer.remove();
    }
    if (this.timeRemainingText) {
      this.timeRemainingText.destroy();
    }

    // Reset packet to initial position
    this.packet.setPosition(this.dX, this.dY);
    this.packet.setVisible(true);

    // Create a tween to launch the packet
    this.packetTween = this.scene.tweens.add({
      targets: this.packet,
      x: this.rX,
      y: this.rY,
      duration: 1500, // Adjust duration as needed
      ease: "Cubic.easeInOut",
      onStart: () => {
        // Optional: Add packet launch sound or additional visual effects
        this.displaySpeechBubble(
          this.dX,
          this.dY - 50,
          `Sending encrypted packet: ${this.encryptedMessage}`
        );
      },
      onComplete: () => {
        // Display packet arrival effect and encrypted message
        this.displayPacketArrivalEffect();
        this.displayReceiverEncryptedMessage();

        // Add this line to perform encryption analysis
        this.fallbackLocalScoring(this.lastMessage, this.encryptedMessage);
      },
    });
  }
  processEncryptionAnalysis(result) {
    // Update security score based on the analysis result
    if (result && result.security_score) {
      this.securityScore = result.security_score;
      this.userScore += result.security_score;

      // Optional: Display feedback
      console.log("Encryption Analysis Result:", result);
      this.displayEncryptionFeedback(result);
    }
  }

  displayEncryptionFeedback(result) {
    // Create a text object to show encryption feedback
    const feedbackText = this.scene.add
      .text(
        this.rX,
        this.rY - 100,
        `Security Score: ${result.security_score}\n${result.feedback || ""}`,
        {
          fontSize: "16px",
          fill: "#ffffff",
          backgroundColor: "#000000",
          padding: 10,
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Fade out the feedback after a few seconds
    this.scene.tweens.add({
      targets: feedbackText,
      alpha: 0,
      duration: 3000,
      delay: 2000,
      onComplete: () => {
        feedbackText.destroy();
      },
    });
  }

  fallbackLocalScoring(originalMessage, encryptedMessage) {
    // Implement a simplified local scoring mechanism
    const localScore = this.calculateLocalEncryptionScore(
      originalMessage,
      encryptedMessage
    );

    this.displayLocalEncryptionFeedback(localScore);
  }

  calculateLocalEncryptionScore(originalMessage, encryptedMessage) {
    // More comprehensive local scoring algorithm
    const lengthFactor = originalMessage.length;
    const uniqueCharsFactor = new Set(encryptedMessage).size;
    const shiftComplexity = this.caesarShift;

    // Calculate a more nuanced score
    const baseScore = (uniqueCharsFactor / lengthFactor) * 10;
    const shiftBonus = (shiftComplexity / 26) * 5;
    const complexityBonus = this.checkEncryptionComplexity(
      originalMessage,
      encryptedMessage
    );

    const totalScore = Math.round(baseScore + shiftBonus + complexityBonus);

    console.log("Encryption Score Breakdown:", {
      baseScore,
      shiftBonus,
      complexityBonus,
      totalScore,
    });

    return Math.min(totalScore, 100); // Cap the score at 100
  }

  checkEncryptionComplexity(originalMessage, encryptedMessage) {
    // Add additional complexity checks
    const differentCharacters = originalMessage
      .split("")
      .filter((char, index) => char !== encryptedMessage[index]).length;

    const complexityRatio = differentCharacters / originalMessage.length;

    return complexityRatio * 20; // Bonus up to 20 points for complexity
  }

  displayLocalEncryptionFeedback(localScore) {
    // Create a more prominent and longer-lasting feedback text
    const feedbackText = this.scene.add
      .text(
        this.scene.scale.width / 2, // Center horizontally
        this.scene.scale.height * 0.2, // Position higher on the screen
        `Local Security Score: ${localScore}`,
        {
          fontSize: "24px",
          fill: "#ffffff",
          backgroundColor: "#000000",
          padding: 10,
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(100); // Ensure it's above other elements

    // Make the feedback more visible and stay longer
    this.scene.tweens.add({
      targets: feedbackText,
      alpha: { from: 0, to: 1 },
      duration: 500,
      yoyo: true,
      hold: 3000,
      onComplete: () => {
        feedbackText.destroy();
      },
    });

    // Update the user's score
    this.userScore = localScore;
    console.log("User Score Updated:", this.userScore);
  }

  openEncryptionTutorial(word) {
    console.log("openEncryptionTutorial called with word:", word);
    console.log("EncryptionTutorial exists:", !!this.EncryptionTutorial);

    if (!this.EncryptionTutorial) {
      console.error("EncryptionTutorial class is not defined");
      return;
    }
    console.log("reached here", word);
    // Start tutorial with the current word
    this.EncryptionTutorial.startEncryptionTutorial(word, (encryptedWord) => {
      console.log("Encryption Tutorial callback received:", encryptedWord);
      this.handleEncryptedWord(encryptedWord);
    });
  }

  handleEncryptedWord(encryptedWord) {
    console.log("handleEncryptedWord called with:", encryptedWord);
    console.log("Current selectedWords:", this.selectedWords);

    // Find the index of the first unencrypted selected word
    const wordIndex = this.tokenizedMessage.indexOf(this.selectedWords[0]);

    // Replace the first selected word with its encrypted version
    this.tokenizedMessage[wordIndex] = encryptedWord;

    // Update the corresponding word text object
    if (this.wordTextObjects[wordIndex]) {
      this.wordTextObjects[wordIndex].setText(encryptedWord);
      this.wordTextObjects[wordIndex].setBackgroundColor("#ff0000"); // Red to indicate encryption
    }

    // Remove the first word from selectedWords
    this.selectedWords.shift();

    // Reconstruct the full encrypted message
    this.encryptedMessage = this.tokenizedMessage.join(" ");
    console.log("Partially Encrypted Message:", this.encryptedMessage);

    // Check if we still have words to encrypt
    if (this.selectedWords.length > 0) {
      console.log("Preparing to encrypt second word:", this.selectedWords[0]);

      // Directly proceed based on the previously chosen encryption method
      if (this.encryptionMethod === "manual") {
        // Ensure visibility and reset any previous popups
        this.closePopup();
        this.wordTextObjects.forEach((wordText) => {
          wordText.setVisible(true);
          wordText.setAlpha(1);
        });

        // Open encryption tutorial for the next word
        this.openEncryptionTutorial(this.selectedWords[0]);
      } else if (this.encryptionMethod === "automatic") {
        // Create a separate popup for automatic encryption progress
        this.menuBackground = this.scene.add.rectangle(
          this.scene.scale.width / 2,
          this.scene.scale.height / 2,
          500,
          300,
          0x000000,
          0.8
        );

        const progressText = this.scene.add
          .text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            "Performing Automatic Encryption...",
            {
              fontSize: "24px",
              fill: "#ffffff",
              align: "center",
            }
          )
          .setOrigin(0.5);

        this.menuElements = [this.menuBackground, progressText];

        // Ensure word text objects are visible
        this.wordTextObjects.forEach((wordText) => {
          wordText.setVisible(true);
          wordText.setAlpha(1);
        });

        // Trigger Caesar cipher encryption animation for the next word
        this.animateCaesarCipherEncryption();
      }
    } else {
      console.log("All words encrypted. Launching packet.");
      this.launchEncryptedPacket();
    }
  }

  displayPacketArrivalEffect() {
    // Create a brief highlight at the receiver's switch
    const arrivalHighlight = this.scene.add.rectangle(
      this.rX,
      this.rY,
      this.packet.width * 1.2,
      this.packet.height * 1.2,
      0x00ff00, // Green highlight
      0.3 // Lower transparency
    );

    // Fade out the highlight
    this.scene.tweens.add({
      targets: arrivalHighlight,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        arrivalHighlight.destroy();
      },
    });
  }

  interpolateWord(original, encrypted, progress) {
    if (progress <= 0.5) {
      // First half of animation: gradually distort original word
      return original
        .split("")
        .map((char, index) => {
          if (index < Math.floor(progress * original.length * 2)) {
            return char;
          }
          return String.fromCharCode(
            char.charCodeAt(0) + Math.floor(Math.random() * 10)
          );
        })
        .join("");
    } else {
      // Second half of animation: gradually reveal encrypted word
      return encrypted
        .split("")
        .map((char, index) => {
          if (index < Math.floor((progress - 0.5) * 2 * encrypted.length)) {
            return char;
          }
          return "_";
        })
        .join("");
    }
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
        ? "Select two words for encryption"
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
        this.displayTokenizedMessage(this.tokenizedMessage);
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
    // Destroy previous menu background and text
    if (this.menuBackground) this.menuBackground.destroy();
    if (this.menuText) this.menuText.destroy();
    if (this.messageInput) this.messageInput.destroy();

    // Destroy any additional menu elements
    if (this.menuElements) {
      this.menuElements.forEach((element) => {
        if (element && element.destroy) element.destroy();
      });
      this.menuElements = [];
    }
  }

  displayTokenizedMessage(tokenizedMessage) {
    // Clear any previous word text objects
    this.wordTextObjects.forEach((wordText) => wordText.destroy());
    this.wordTextObjects = [];

    // Calculate starting position within the popup
    const popupCenterX = this.scene.scale.width / 2;
    const popupCenterY = this.scene.scale.height / 2;
    const wordSpacing = 100; // Space between words
    const startX =
      popupCenterX - ((tokenizedMessage.length - 1) * wordSpacing) / 2;

    this.wordTextObjects = tokenizedMessage.map((word, index) => {
      const wordText = this.scene.add
        .text(
          startX + index * wordSpacing,
          popupCenterY + 50, // Position below the prompt text
          word,
          {
            font: "20px Arial",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: 5,
          }
        )
        .setOrigin(0.5)
        .setDepth(2)
        .setInteractive();

      // Add click event for word selection
      wordText.on("pointerdown", () => this.handleWordClick(index));

      return wordText;
    });
  }

  handleWordClick(index) {
    const selectedWord = this.tokenizedMessage[index];

    // Avoid adding duplicates to selectedWords
    if (!this.selectedWords.includes(selectedWord)) {
      if (this.selectedWords.length < 2) {
        // Highlight the selected word
        this.wordTextObjects[index].setBackgroundColor("#00ff00"); // Green background
        this.selectedWords.push(selectedWord);
        console.log("Selected word:", selectedWord);

        if (this.selectedWords.length === 2) {
          console.log("Ready to encrypt:", this.selectedWords);
          this.wordTextObjects.forEach((wordText) =>
            wordText.setVisible(false)
          );
          // Create encryption method selection popup
          this.showEncryptionMethodSelection();
        }
      }
    } else {
      console.log("Word already selected:", selectedWord);
      // Reopen the popup for the selected word
      if (this.selectedWords.length === 1) {
        this.showEncryptionMethodSelection();
      }
      this.wordTextObjects.forEach((wordText) => wordText.destroy());
      this.wordTextObjects = [];
    }
  }
  handleManualEncryption(event) {
    // Modify existing method to work with new encryption approach
    if (this.selectedWords.length < 2) {
      if (event.key === "ArrowRight") {
        this.currentEncryptIndex =
          (this.currentEncryptIndex + 1) % this.tokenizedMessage.length;
      } else if (event.key === "ArrowLeft") {
        this.currentEncryptIndex =
          (this.currentEncryptIndex - 1 + this.tokenizedMessage.length) %
          this.tokenizedMessage.length;
      } else if (event.key === "Enter") {
        const selectedWord = this.tokenizedMessage[this.currentEncryptIndex];
        this.selectedWords.push(selectedWord);

        if (this.selectedWords.length === 2) {
          this.isEncrypting = true;
          // this.menuText.setText("Two words selected. Encrypting...");

          // Trigger Caesar cipher encryption animation
          this.animateCaesarCipherEncryption();
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

    // Destroy word text objects
    this.wordTextObjects.forEach((wordText) => wordText.destroy());
    this.wordTextObjects = [];

    // Reset menu text
    // this.menuText.setText("Encryption complete!");

    // Optional: Add a delay and then close the popup
    this.scene.time.delayedCall(1000, () => {
      this.closePopup();
    });
  }

  // Adding Timer Functionality
  startEncryptionTimer() {
    // Clear any existing timer
    if (this.encryptionTimer) {
      this.encryptionTimer.remove();
    }

    // Remove previous time remaining text if exists
    if (this.timeRemainingText) {
      this.timeRemainingText.destroy();
    }

    // Create timer text
    this.timeRemainingText = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height * 0.1,
        `Time Remaining: ${this.encryptionTimeLimit}`,
        {
          fontSize: "24px",
          fill: "#ffffff",
          backgroundColor: "#000000",
          padding: 10,
        }
      )
      .setOrigin(0.5);

    // Start countdown
    this.encryptionTimer = this.scene.time.addEvent({
      delay: 1000, // 1 second intervals
      repeat: this.encryptionTimeLimit - 1,
      callback: () => {
        const timeRemaining = this.encryptionTimer.getRepeatCount();

        // Update timer text
        this.timeRemainingText.setText(`Time Remaining: ${timeRemaining}`);

        // Change color as time runs out
        if (timeRemaining <= 10) {
          this.timeRemainingText.setColor("#ff0000"); // Red when time is low
        }

        // Time expired
        if (timeRemaining === 0) {
          this.handleEncryptionFailure();
        }
      },
    });
  }

  handleEncryptionFailure() {
    // Stop any ongoing encryption
    this.isEncrypting = false;

    // Display failure message
    const failureText = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        "Encryption Failed!\nTime Ran Out",
        {
          fontSize: "36px",
          fill: "#ff0000",
          backgroundColor: "#000000",
          padding: 10,
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Fade out failure message
    this.scene.tweens.add({
      targets: failureText,
      alpha: 0,
      duration: 2000,
      delay: 2000,
      onComplete: () => {
        failureText.destroy();
        this.closePopup();
        this.gameOver();
      },
    });
  }

  gameOver() {
    // initiated game over sequence
    this.isTerminating = true;

    // Adding shake effect
    this.scene.cameras.main.shake(500);

    // listen for event completion
    this.scene.cameras.main.on(
      "camerashakecomplete",
      function (camera, effect) {
        // fade out
        this.scene.cameras.main.fade(500);
        // this.scene.restart();
      },
      this
    );

    this.scene.cameras.main.on(
      "camerafadeoutcomplete",
      function () {
        this.scene.scene.restart();
      },
      this
    );
  }
}
