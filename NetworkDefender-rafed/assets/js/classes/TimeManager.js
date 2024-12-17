class TimeManager {
  constructor(scene) {
    this.scene = scene;
    this.totalTime = 60000; // 60 seconds in milliseconds
    this.timeRemaining = this.totalTime;
    this.isActive = false;
    this.penalties = 0;
    this.warningTween = null; // Initialize as null

    // Create timer display
    this.createTimerDisplay();
  }

  createTimerDisplay() {
    // Timer container
    this.timerContainer = this.scene.add.container(10, 10);

    // Background for timer
    const bg = this.scene.add
      .rectangle(0, 0, 200, 40, 0x000000, 0.7)
      .setOrigin(0, 0);

    // Timer icon
    const timerIcon = this.scene.add
      .text(10, 10, "⏱️", { fontSize: "20px" })
      .setOrigin(0, 0);

    // Timer text
    this.timerText = this.scene.add
      .text(40, 10, "60:00", {
        fontSize: "20px",
        fontFamily: "Courier New",
        fill: "#00ff00",
      })
      .setOrigin(0, 0);

    this.timerContainer.add([bg, timerIcon, this.timerText]);

    // Create warning flash tween
    this.createWarningTween();
  }

  createWarningTween() {
    // Create the warning tween but don't start it yet
    this.warningTween = this.scene.tweens.create({
      targets: this.timerText,
      alpha: { from: 1, to: 0.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      paused: true, // Start paused
    });
  }

  startTimer() {
    if (!this.isActive) {
      this.isActive = true;
      this.lastUpdate = this.scene.time.now;

      // Create timer event
      this.timerEvent = this.scene.time.addEvent({
        delay: 100,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true,
      });
    }
  }

  updateTimer() {
    if (!this.isActive) return;

    const currentTime = this.scene.time.now;
    const delta = currentTime - this.lastUpdate;
    this.lastUpdate = currentTime;

    this.timeRemaining -= delta;

    // Update display
    const seconds = Math.ceil(this.timeRemaining / 1000);
    this.timerText.setText(`${seconds.toString().padStart(2, "0")}s`);

    // Warning colors based on time remaining
    if (seconds <= 10) {
      this.timerText.setColor("#ff0000");
      if (this.warningTween && !this.warningTween.isPlaying()) {
        this.warningTween.play();
      }
    } else if (seconds <= 20) {
      this.timerText.setColor("#ff9900");
      if (this.warningTween && this.warningTween.isPlaying()) {
        this.warningTween.stop();
        this.timerText.alpha = 1; // Reset alpha
      }
    } else {
      this.timerText.setColor("#00ff00");
      if (this.warningTween && this.warningTween.isPlaying()) {
        this.warningTween.stop();
        this.timerText.alpha = 1; // Reset alpha
      }
    }

    // Time's up
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.isActive = false;
      this.timerEvent.remove();
      if (this.warningTween) {
        this.warningTween.stop();
        this.timerText.alpha = 1; // Reset alpha
      }
      this.scene.events.emit("timeUp");
    }
  }

  addPenalty(seconds) {
    this.timeRemaining -= seconds * 1000;
    this.penalties += 1;

    // Create penalty flash effect
    const penaltyText = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        `-${seconds}s PENALTY`,
        {
          fontSize: "32px",
          fill: "#ff0000",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5);

    this.scene.tweens.add({
      targets: penaltyText,
      alpha: 0,
      y: "-=50",
      duration: 1000,
      ease: "Power2",
      onComplete: () => penaltyText.destroy(),
    });
  }

  // Clean up when scene is shut down
  destroy() {
    if (this.warningTween) {
      this.warningTween.stop();
      this.warningTween = null;
    }
    if (this.timerEvent) {
      this.timerEvent.remove();
    }
    this.timerContainer.destroy();
  }
}

window.TimeManager = TimeManager;
