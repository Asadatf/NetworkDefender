class WalletManager {
  constructor(scene) {
    this.scene = scene;
    this.coins = 50; // Starting amount
    this.createWalletDisplay();
  }

  createWalletDisplay() {
    // Wallet container
    this.walletContainer = this.scene.add.container(220, 10);

    // Background
    const bg = this.scene.add
      .rectangle(0, 0, 200, 40, 0x000000, 0.7)
      .setOrigin(0, 0);

    // Coin icon
    const coinIcon = this.scene.add
      .text(10, 10, "💰", { fontSize: "20px" })
      .setOrigin(0, 0);

    // Coin amount text
    this.coinText = this.scene.add
      .text(40, 10, `${this.coins} CC`, {
        fontSize: "20px",
        fontFamily: "Courier New",
        fill: "#ffd700",
      })
      .setOrigin(0, 0);

    this.walletContainer.add([bg, coinIcon, this.coinText]);
  }

  spend(amount) {
    if (this.coins >= amount) {
      this.coins -= amount;
      this.updateDisplay();

      // Create spending effect
      this.createSpendingEffect(amount);
      return true;
    }
    return false;
  }

  createSpendingEffect(amount) {
    const spendText = this.scene.add
      .text(
        this.walletContainer.x + 100,
        this.walletContainer.y + 20,
        `-${amount} CC`,
        {
          fontSize: "24px",
          fill: "#ff0000",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5);

    this.scene.tweens.add({
      targets: spendText,
      alpha: 0,
      y: "+=30",
      duration: 1000,
      ease: "Power2",
      onComplete: () => spendText.destroy(),
    });
  }

  addBonus(amount) {
    this.coins += amount;
    this.updateDisplay();

    // Create bonus effect
    const bonusText = this.scene.add
      .text(
        this.walletContainer.x + 100,
        this.walletContainer.y + 20,
        `+${amount} CC`,
        {
          fontSize: "24px",
          fill: "#00ff00",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5);

    this.scene.tweens.add({
      targets: bonusText,
      alpha: 0,
      y: "-=30",
      duration: 1000,
      ease: "Power2",
      onComplete: () => bonusText.destroy(),
    });
  }

  updateDisplay() {
    this.coinText.setText(`${this.coins} CC`);
  }
}

window.WalletManager = WalletManager;
