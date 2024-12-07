class MessageHandler {
  constructor(scene, packet, red_briefcase, dX, dY, rX, rY) {
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
    this.caesarShift = 3
    this.securityScore = 0;
    this.userScore = 0;
    this.interceptAnimationGroup = null;
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
        }
      });
    });
  }

  async performAdvancedEncryptionAnalysis(originalMessage, encryptedMessage) {
    try {
        const response = await fetch(this.encryptionAnalysisEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                original_message: originalMessage,
                encrypted_message: encryptedMessage,
                encryption_method: 'caesar_cipher'
            })
        });

        const result = await response.json();

        if (result.success) {
            this.processEncryptionAnalysis(result);
        } else {
            console.error('Encryption analysis failed', result.error);
        }
    } catch (error) {
        console.error('Error performing encryption analysis:', error);
    }
}



  caesarCipherEncrypt(text, shift) {
    return text.split('').map(char => {
      // Only encrypt alphabetic characters
      if (char.match(/[a-zA-Z]/)) {
        // Determine the base (uppercase or lowercase)
        const base = char.toLowerCase() === char ? 'a'.charCodeAt(0) : 'A'.charCodeAt(0);
        
        // Apply Caesar cipher shift
        return String.fromCharCode(
          ((char.charCodeAt(0) - base + shift + 26) % 26) + base
        );
      }
      // Return non-alphabetic characters as-is
      return char;
    }).join('');
  }

  animateCaesarCipherEncryption() {
    if (!this.isEncrypting || this.selectedWords.length !== 2) return;

    // Find the indices of the selected words
    const wordIndices = this.selectedWords.map(word => 
      this.tokenizedMessage.indexOf(word)
    );

    // Create encryption animation
    wordIndices.forEach(wordIndex => {
      const originalWord = this.tokenizedMessage[wordIndex];
      const encryptedWord = this.caesarCipherEncrypt(originalWord, this.caesarShift);

      // Animate word transformation
      const wordText = this.wordTextObjects[wordIndex];
      
      // Create a tween to animate the word encryption
      this.scene.tweens.add({
        targets: wordText,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 500,
        yoyo: true,
        ease: 'Quad.easeInOut',
        onUpdate: (tween) => {
          const progress = tween.getValue();
          // Interpolate between original and encrypted word
          const currentWord = this.interpolateWord(originalWord, encryptedWord, progress);
          wordText.setText(currentWord);
        },
        onComplete: () => {
          // Set final encrypted word
          wordText.setText(encryptedWord);
          wordText.setBackgroundColor('#ff0000'); // Red to indicate encryption
          this.updateEncryptedMessage(encryptedWord, wordIndex);
        }
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
    this.encryptedMessage = this.tokenizedMessage.join(' ');
    console.log("Full Encrypted Message:", this.encryptedMessage);
  }

  launchEncryptedPacket() {
    // Reset packet to initial position
    this.packet.setPosition(this.dX, this.dY);
    this.packet.setVisible(true);

    // Create a tween to launch the packet
    this.packetTween = this.scene.tweens.add({
      targets: this.packet,
      x: this.rX,
      y: this.rY,
      duration: 1500, // Adjust duration as needed
      ease: 'Cubic.easeInOut',
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
      }
    });
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
      }
    });
  }

  interpolateWord(original, encrypted, progress) {
    if (progress <= 0.5) {
      // First half of animation: gradually distort original word
      return original.split('').map((char, index) => {
        if (index < Math.floor(progress * original.length * 2)) {
          return char;
        }
        return String.fromCharCode(
          char.charCodeAt(0) + Math.floor(Math.random() * 10)
        );
      }).join('');
    } else {
      // Second half of animation: gradually reveal encrypted word
      return encrypted.split('').map((char, index) => {
        if (index < Math.floor((progress - 0.5) * 2 * encrypted.length)) {
          return char;
        }
        return '_';
      }).join('');
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
    this.menuBackground.destroy();
    this.menuText.destroy();
    this.messageInput.destroy();
  }

  displayTokenizedMessage(tokenizedMessage) {
    // Clear any previous word text objects
    this.wordTextObjects.forEach((wordText) => wordText.destroy());
    this.wordTextObjects = [];
  
    // Calculate starting position within the popup
    const popupCenterX = this.scene.scale.width / 2;
    const popupCenterY = this.scene.scale.height / 2;
    const wordSpacing = 100; // Space between words
    const startX = popupCenterX - ((tokenizedMessage.length - 1) * wordSpacing) / 2;
  
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
            padding: 5
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
    if (this.selectedWords.length < 2) {
      const selectedWord = this.tokenizedMessage[index];
      
      // Highlight the selected word
      this.wordTextObjects[index].setBackgroundColor('#00ff00'); // Green background
      
      this.selectedWords.push(selectedWord);
      console.log("Selected word:", selectedWord);
  
      if (this.selectedWords.length === 2) {
        console.log("Ready to encrypt:", this.selectedWords);
        this.isEncrypting = true;
        this.menuText.setText("Two words selected. Encrypting...");
        
        // Trigger Caesar cipher encryption animation
        this.animateCaesarCipherEncryption();
      }
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
          this.menuText.setText("Two words selected. Encrypting...");
          
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
    this.menuText.setText("Encryption complete!");
  
    // Optional: Add a delay and then close the popup
    this.scene.time.delayedCall(1000, () => {
      this.closePopup();
    });
  }
}
