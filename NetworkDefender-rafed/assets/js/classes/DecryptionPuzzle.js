class DecryptionPuzzle {
  constructor(scene, messageHandler) {
    this.scene = scene;
    this.messageHandler = messageHandler;
    this.puzzleText = null;
    this.solution = "";
    this.playerInput = "";
    this.checkSolutionButton = null;
    this.isPuzzleSolved = false;
    this.onSolvedCallbacks = [];
    this.particles = null;
    this.backgroundElements = [];
  }

  generatePuzzle() {
    this.isPuzzleSolved = false;
    this.closeExistingElements();
    this.createBackground();

    this.originalText = this.generateRandomWord();
    this.solution = this.caesarCipherEncrypt(this.originalText, 3);
    this.playerInput = "";

    // Create a stylish container for the puzzle
    const puzzleContainer = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2 - 150);
    
    // Add decorative elements
    this.decorativeLine = this.scene.add.graphics();
    this.decorativeLine.lineStyle(2, 0x00ff00, 0.8);
    this.decorativeLine.lineBetween(-150, -40, 150, -40);
    puzzleContainer.add(this.decorativeLine);

    // Create title with animation
    this.titleText = this.scene.add.text(0, -80, "DECRYPT THE MESSAGE", {
      fontSize: '28px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Add pulse animation to title
    this.scene.tweens.add({
      targets: this.titleText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Create encrypted text with typewriter effect
    this.encryptedText = this.scene.add.text(0, 0, '', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Typewriter effect for encrypted text
    let displayText = `${this.solution}`;
    let currentChar = 0;
    const typewriterTimer = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        this.encryptedText.text += displayText[currentChar];
        currentChar++;
        if (currentChar === displayText.length) {
          typewriterTimer.destroy();
        }
      },
      repeat: displayText.length - 1
    });

    // Create input field with styling
    this.inputText = this.scene.add.text(0, 60, "Your Input: ", {
      fontSize: '24px',
      fill: '#4CAF50',
      backgroundColor: '#1a1a1a',
      padding: { x: 10, y: 5 },
      fixedWidth: 300
    }).setOrigin(0.5);

    // Add elements to container
    puzzleContainer.add([this.titleText, this.encryptedText, this.inputText]);
    
    this.createStylishInstructions();
    this.createAnimatedButton();
    this.setupInputHandler();
    this.createParticleEffect();
  }

  createBackground() {
    // Create a dark overlay
    const overlay = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      0x000000,
      0.85
    );

    // Create matrix-style falling characters
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * this.scene.scale.width;
      const startY = Math.random() * this.scene.scale.height;
      const text = this.scene.add.text(x, startY, this.getRandomChar(), {
        fontSize: '16px',
        fill: '#00ff00',
        alpha: 0.3
      });

      this.scene.tweens.add({
        targets: text,
        y: this.scene.scale.height + 50,
        duration: 3000 + Math.random() * 5000,
        repeat: -1,
        onRepeat: () => {
          text.y = -50;
          // text.setText(this.getRandomChar());
        }
      });

      this.backgroundElements.push(text);
    }
    
    this.backgroundElements.push(overlay);
  }

  createStylishInstructions() {
    const instructionsContainer = this.scene.add.container(
      this.scene.scale.width - 400,
      this.scene.scale.height / 2
    );

    // Create a stylish background panel
    const panel = this.scene.add.graphics();
    panel.fillStyle(0x1a1a1a, 0.9);
    panel.fillRoundedRect(-200, -200, 400, 400, 16);
    panel.lineStyle(2, 0x00ff00, 0.8);
    panel.strokeRoundedRect(-200, -200, 400, 400, 16);

    const title = this.scene.add.text(0, -170, "Decryption Guide", {
      fontSize: '24px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const instructions = this.scene.add.text(0, -50, [
      "Caesar Cipher Shift: 3",
      "",
      "Original:  ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      "Shifted:   DEFGHIJKLMNOPQRSTUVWXYZABC",
      "",
      "To decrypt:",
      "• Find encrypted letter",
      "• Shift 3 places LEFT",
      "• Type solution",
      "",
      "Press BACKSPACE to undo"
    ].join('\n'), {
      fontSize: '16px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    instructionsContainer.add([panel, title, instructions]);
    this.backgroundElements.push(instructionsContainer);
  }

  createAnimatedButton() {
    const buttonBackground = this.scene.add.graphics();
    buttonBackground.fillStyle(0x00ff00, 1);
    buttonBackground.fillRoundedRect(-100, -25, 200, 50, 10);

    this.checkSolutionButton = this.scene.add.container(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2 + 150,
      [
        buttonBackground,
        this.scene.add.text(0, 0, "CHECK SOLUTION", {
          fontSize: '20px',
          fill: '#000000',
          fontStyle: 'bold'
        }).setOrigin(0.5)
      ]
    ).setSize(200, 50);

    this.checkSolutionButton.setInteractive()
      .on('pointerover', () => {
        buttonBackground.clear();
        buttonBackground.fillStyle(0x4CAF50, 1);
        buttonBackground.fillRoundedRect(-100, -25, 200, 50, 10);
      })
      .on('pointerout', () => {
        buttonBackground.clear();
        buttonBackground.fillStyle(0x00ff00, 1);
        buttonBackground.fillRoundedRect(-100, -25, 200, 50, 10);
      })
      .on('pointerdown', () => this.checkSolution());
  }

  createParticleEffect() {
    // Create particle effect for correct solution
    this.particles = this.scene.add.particles(0, 0, 'packet', {
      speed: { min: -800, max: 800 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      active: false,
      lifespan: 600,
      gravityY: 800
    });
  }

  checkSolution() {
    if (this.playerInput.toLowerCase() === this.originalText.toLowerCase()) {
      // Store success text reference for cleanup
      const successText = this.scene.add.text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        "DECRYPTION SUCCESSFUL!",
        {
          fontSize: '36px',
          fill: '#00ff00',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5).setAlpha(0);

      // Trigger particle effect
      this.particles.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);
      this.particles.explode(50);

      // Success animation sequence
      this.scene.tweens.add({
        targets: successText,
        alpha: 1,
        scale: 1.2,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          // Fade out animation
          this.scene.tweens.add({
            targets: successText,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
              // Clean up all elements
              successText.destroy();
              this.closeExistingElements();
              this.isPuzzleSolved = true;
              this.emitSolved();
            }
          });
        }
      });
    } else {
      // Wrong answer shake animation
      this.scene.tweens.add({
        targets: this.inputText,
        x: '+=10',
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          this.playerInput = '';
          this.inputText.setText('Your Input: ');
        }
      });
    }
  }

  closeExistingElements() {
    // Ensure all elements are properly destroyed
    if (this.puzzleText) this.puzzleText.destroy();
    if (this.inputText) this.inputText.destroy();
    if (this.checkSolutionButton) this.checkSolutionButton.destroy();
    if (this.particles) this.particles.destroy();
    if (this.titleText) this.titleText.destroy();
    if (this.encryptedText) this.encryptedText.destroy();
    if (this.decorativeLine) this.decorativeLine.destroy();
    
    
    
    // Clean up background elements
    this.backgroundElements.forEach(element => {
      if (element && element.destroy) {
        element.destroy();
      }
    });
    this.backgroundElements = [];

    // Remove any remaining tweens
    this.scene.tweens.killAll();
  }

  getRandomChar() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Existing utility methods remain the same
  generateRandomWord() {
    const words = ["cyber", "secure", "network", "packet", "encrypt", "defend", "protect", "shield"];
    return words[Math.floor(Math.random() * words.length)];
  }

  caesarCipherEncrypt(text, shift) {
    return text
      .split("")
      .map((char) =>
        String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97)
      )
      .join("");
  }

  setupInputHandler() {
    this.scene.input.keyboard.removeAllListeners("keydown");
    this.scene.input.keyboard.on("keydown", (event) => {
      if (/^[a-z]$/i.test(event.key)) {
        this.playerInput += event.key;
        this.inputText.setText(`Your Input: ${this.playerInput}`);
      } else if (event.key === "Backspace") {
        this.playerInput = this.playerInput.slice(0, -1);
        this.inputText.setText(`Your Input: ${this.playerInput}`);
      }
    });
  }

  emitSolved() {
    this.onSolvedCallbacks.forEach((callback) => callback());
  }

  onSolved(callback) {
    this.onSolvedCallbacks.push(callback);
  }

  isSolved() {
    return this.isPuzzleSolved;
  }
}

window.DecryptionPuzzle = DecryptionPuzzle;