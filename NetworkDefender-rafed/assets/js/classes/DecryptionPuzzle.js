class DecryptionPuzzle {
  constructor(scene, messageHandler) {
    this.scene = scene;
    this.messageHandler = messageHandler; // Pass message handler to allow proceeding
    this.puzzleText = null;
    this.solution = "";
    this.playerInput = "";
    this.checkSolutionButton = null;
    this.isPuzzleSolved = false;
    this.onSolvedCallbacks = [];
  }

  generatePuzzle() {
    // Reset the solved state
    this.isPuzzleSolved = false;
    // Clear any previous puzzle elements
    this.closeExistingElements();

    // Generate a simple substitution cipher puzzle
    this.originalText = this.generateRandomWord();
    this.solution = this.caesarCipherEncrypt(this.originalText, 3);
    this.playerInput = ""; // Reset player input

    // Display the encrypted text
    this.puzzleText = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2 - 100,
        `Decrypt: ${this.solution}`,
        { fontSize: "24px", fill: "#ffffff" }
      )
      .setOrigin(0.5);

    // Create input display text
    this.inputText = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2 - 50,
        "Your Input: ",
        { fontSize: "20px", fill: "#ffffff" }
      )
      .setOrigin(0.5);

    // Create instructions container
    this.createDecryptionInstructions();

    // Add check solution button
    this.createCheckSolutionButton();

    // Setup keyboard input
    this.setupInputHandler();
  }

  closeExistingElements() {
    // Destroy previous puzzle elements if they exist
    if (this.puzzleText) {
      this.puzzleText.destroy();
    }
    if (this.inputText) {
      this.inputText.destroy();
    }
    if (this.checkSolutionButton) {
      this.checkSolutionButton.destroy();
    }
    if (this.instructionsContainer) {
      this.instructionsContainer.destroy();
    }
  }

  createDecryptionInstructions() {
    // Create a container for instructions
    this.instructionsContainer = this.scene.add.container(
      this.scene.scale.width - 400, // Adjust x to be near the right edge
      200 //
    );

    // Title
    const titleText = this.scene.add
      .text(0, -150, "Decryption Guide", {
        fontSize: "24px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Create alphabet shift demonstration
    const originalAlphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    const shiftedAlphabet = this.getShiftedAlphabet(3);

    // Alphabet comparison text
    const instructionText = this.scene.add
      .text(
        0,
        -100,
        [
          "How Caesar Cipher Works:",
          "We shifted the alphabet by 3 positions to the RIGHT",
          "",
          "Original:  a b c d e f g h i j k l m n o p q r s t u v w x y z",
          "Shifted:   d e f g h i j k l m n o p q r s t u v w x y z a b c",
          "",
          "To decrypt:",
          "- Look at the SHIFTED alphabet",
          "- Find your encrypted letter",
          "- Move 3 positions to the LEFT to get the original letter",
        ].join("\n"),
        {
          fontSize: "16px",
          fill: "#ffffff",
          align: "left",
        }
      )
      .setOrigin(0.5);

    // Add demonstration components to container
    this.instructionsContainer.add([titleText, instructionText]);

    // Optional: Add a background to make it more visible
    // const background = this.scene.add
    //   .rectangle(0, 0, 300, 300, 0x333333, 0.7)
    //   .setOrigin(0.5);
    // this.instructionsContainer.add(background);
    // this.instructionsContainer.sendToBack(background);
  }

  getShiftedAlphabet(shift) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    return alphabet.map((_, index) => alphabet[(index + shift) % 26]);
  }

  createCheckSolutionButton() {
    // Remove previous button if exists
    if (this.checkSolutionButton) {
      this.checkSolutionButton.destroy();
    }

    // Create check solution button
    this.checkSolutionButton = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2 + 100,
        "Check Solution",
        {
          fontSize: "24px",
          fill: "#ffffff",
          backgroundColor: "#444444",
          padding: 10,
        }
      )
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => this.checkSolution());
  }

  setupInputHandler() {
    // Remove any existing keyboard listener
    this.scene.input.keyboard.removeAllListeners("keydown");

    this.scene.input.keyboard.on("keydown", (event) => {
      if (/^[a-z]$/.test(event.key)) {
        this.playerInput += event.key;
        // Update input display
        this.inputText.setText(`Your Input: ${this.playerInput}`);
      } else if (event.key === "Backspace") {
        // Allow backspace to remove last character
        this.playerInput = this.playerInput.slice(0, -1);
        this.inputText.setText(`Your Input: ${this.playerInput}`);
      }
    });
  }

  checkSolution() {
    if (this.playerInput === this.originalText) {
      this.puzzleText.setText("Puzzle Solved!");
      this.closeExistingElements();
      this.isPuzzleSolved = true;
      this.emitSolved(); // Trigger solved callbacks
    } else {
      this.puzzleText.setText("Wrong Solution. Try Again!");
      this.generatePuzzle(); // Regenerate the puzzle
    }
  }

  emitSolved() {
    this.onSolvedCallbacks.forEach((callback) => callback());
  }

  onSolved(callback) {
    this.onSolvedCallbacks.push(callback);
  }

  // Existing methods remain the same
  generateRandomWord() {
    const words = ["cyber", "secure", "network", "packet", "encrypt"];
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

  isSolved() {
    return this.isPuzzleSolved;
  }
}

window.DecryptionPuzzle = DecryptionPuzzle;
