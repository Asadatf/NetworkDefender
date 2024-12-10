class EncryptionTutorial {
  constructor(scene) {
    this.scene = scene;
    this.alphabetLowercase = "abcdefghijklmnopqrstuvwxyz";
    this.alphabetUppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.currentShift = 3; // Default Caesar cipher shift
    this.selectedWord = "";
    this.tutorialStage = 0;
    this.tutorialElements = [];
  }

  startEncryptionTutorial(word, onEncryptCallback) {
    this.selectedWord = word.toLowerCase();
    this.onEncryptCallback = onEncryptCallback;
    this.createEncryptionInterface();
  }

  createEncryptionInterface() {
    // Clear any existing tutorial elements
    this.tutorialElements.forEach((element) => element.destroy());
    this.tutorialElements = [];

    // Create background
    const background = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      600,
      400,
      0x000000,
      0.8
    );
    this.tutorialElements.push(background);

    // Title
    const title = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 4 - 100,
        "Caesar Cipher Encryption Tutorial",
        { fontSize: "24px", fill: "#ffffff" }
      )
      .setOrigin(0.5);
    this.tutorialElements.push(title);

    // Original Word Display
    const originalWordText = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 4,
        `Original Word: ${this.selectedWord}`,
        { fontSize: "20px", fill: "#ffffff" }
      )
      .setOrigin(0.5);
    this.tutorialElements.push(originalWordText);

    // Create interactive alphabet shift display
    this.createAlphabetShiftDisplay();

    // Shift Control Buttons
    this.createShiftControlButtons();

    // Encrypt Button
    const encryptButton = this.scene.add
      .text(
        this.scene.scale.width / 2,
        (this.scene.scale.height * 3) / 4 + 50,
        "Encrypt",
        {
          fontSize: "20px",
          fill: "#00ff00",
          backgroundColor: "#004400",
          padding: 10,
        }
      )
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => this.encryptWord());
    this.tutorialElements.push(encryptButton);
  }

  createAlphabetShiftDisplay() {
    // Original Alphabet
    const originalAlphabetText = this.scene.add
      .text(
        this.scene.scale.width / 2 - 150,
        this.scene.scale.height / 2,
        this.alphabetLowercase,
        { fontSize: "18px", fill: "#ffffff" }
      )
      .setOrigin(0, 0.5);
    this.tutorialElements.push(originalAlphabetText);

    // Shifted Alphabet
    this.shiftedAlphabetText = this.scene.add
      .text(
        this.scene.scale.width / 2 + 150,
        this.scene.scale.height / 2,
        this.getShiftedAlphabet(this.currentShift),
        { fontSize: "18px", fill: "#00ff00" }
      )
      .setOrigin(1, 0.5);
    this.tutorialElements.push(this.shiftedAlphabetText);

    // Shift Indicator
    this.shiftIndicator = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2 + 50,
        `Current Shift: ${this.currentShift}`,
        { fontSize: "20px", fill: "#ffffff" }
      )
      .setOrigin(0.5);
    this.tutorialElements.push(this.shiftIndicator);
  }

  createShiftControlButtons() {
    // Decrease Shift Button
    const decreaseShiftButton = this.scene.add
      .text(
        this.scene.scale.width / 2 - 100,
        this.scene.scale.height / 2 + 100,
        "← Decrease Shift",
        {
          fontSize: "18px",
          fill: "#ff0000",
          backgroundColor: "#440000",
          padding: 5,
        }
      )
      .setInteractive()
      .on("pointerdown", () => this.adjustShift(-1));
    this.tutorialElements.push(decreaseShiftButton);

    // Increase Shift Button
    const increaseShiftButton = this.scene.add
      .text(
        this.scene.scale.width / 2 + 100,
        this.scene.scale.height / 2 + 100,
        "Increase Shift →",
        {
          fontSize: "18px",
          fill: "#00ff00",
          backgroundColor: "#004400",
          padding: 5,
        }
      )
      .setInteractive()
      .on("pointerdown", () => this.adjustShift(1));
    this.tutorialElements.push(increaseShiftButton);
  }

  adjustShift(amount) {
    // Ensure shift stays within 1-25 range
    this.currentShift = Math.max(1, Math.min(25, this.currentShift + amount));

    // Update shift indicator and shifted alphabet
    this.shiftIndicator.setText(`Current Shift: ${this.currentShift}`);
    this.shiftedAlphabetText.setText(
      this.getShiftedAlphabet(this.currentShift)
    );
  }

  getShiftedAlphabet(shift) {
    return this.alphabetLowercase
      .split("")
      .map((char, index) => this.alphabetLowercase[(index + shift) % 26])
      .join("");
  }

  encryptWord() {
    const encryptedWord = this.caesarCipherEncrypt(
      this.selectedWord,
      this.currentShift
    );

    // Display encrypted result
    const resultText = this.scene.add
      .text(
        this.scene.scale.width / 2,
        (this.scene.scale.height * 3) / 4 + 100,
        `Encrypted Word: ${encryptedWord}`,
        {
          fontSize: "22px",
          fill: "#00ff00",
          backgroundColor: "#004400",
          padding: 10,
        }
      )
      .setOrigin(0.5);
    this.tutorialElements.push(resultText);

    // Optional: Add explanation of encryption process
    const explanationText = this.scene.add
      .text(
        this.scene.scale.width / 2,
        (this.scene.scale.height * 3) / 4 + 150,
        `Each letter shifted ${this.currentShift} positions in the alphabet`,
        {
          fontSize: "18px",
          fill: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5);
    this.tutorialElements.push(explanationText);

    // Add a button to confirm and proceed
    const confirmButton = this.scene.add
      .text(
        this.scene.scale.width / 2,
        (this.scene.scale.height * 3) / 4 + 200,
        "Confirm Encryption",
        {
          fontSize: "20px",
          fill: "#ffffff",
          backgroundColor: "#006600",
          padding: 10,
        }
      )
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => {
        // Call the callback with the encrypted word
        if (this.onEncryptCallback) {
          this.onEncryptCallback(encryptedWord);
          this.closeTutorial();
        }
      });
    this.tutorialElements.push(confirmButton);
  }

  caesarCipherEncrypt(text, shift) {
    return text
      .split("")
      .map((char) => {
        // Check if character is a letter
        if (/[a-zA-Z]/.test(char)) {
          const isUpperCase = char === char.toUpperCase();
          const alphabet = isUpperCase
            ? this.alphabetUppercase
            : this.alphabetLowercase;

          const index = alphabet.indexOf(char.toLowerCase());
          const shiftedIndex = (index + shift) % 26;

          return isUpperCase
            ? this.alphabetUppercase[shiftedIndex]
            : this.alphabetLowercase[shiftedIndex];
        }
        return char;
      })
      .join("");
  }

  // Method to close the tutorial
  closeTutorial() {
    this.tutorialElements.forEach((element) => element.destroy());
    this.tutorialElements = [];
  }
}
window.EncryptionTutorial = EncryptionTutorial;
