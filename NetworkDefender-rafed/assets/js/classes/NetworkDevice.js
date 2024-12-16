class NetworkDevice extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    
    this.setScale(0.1);
    this.type = key;
    this.scene.add.existing(this);
    
    // Add visual enhancements
    this.addDeviceEffects();
  }

  addDeviceEffects() {
    // Add pulsing effect
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.11,
      scaleY: 0.11,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Add hover effect
    this.setInteractive()
      .on('pointerover', () => {
        this.setTint(0x00ff00);
        this.createHoverEffect();
      })
      .on('pointerout', () => {
        this.clearTint();
        if (this.hoverEffect) {
          this.hoverEffect.destroy();
        }
      });
  }

  createHoverEffect() {
    this.hoverEffect = this.scene.add.graphics();
    this.hoverEffect.lineStyle(2, 0x00ff00, 0.8);
    this.hoverEffect.strokeCircle(this.x, this.y, this.width * 0.6);
    
    this.scene.tweens.add({
      targets: this.hoverEffect,
      alpha: 0,
      duration: 1000,
      repeat: -1,
      yoyo: true
    });
  }

  highlight(isHighlighted) {
    if (isHighlighted) {
      this.setTint(0x00ff00);
      this.createHighlightEffect();
    } else {
      this.clearTint();
      if (this.highlightEffect) {
        this.highlightEffect.destroy();
      }
    }
  }

  createHighlightEffect() {
    this.highlightEffect = this.scene.add.graphics();
    const radius = this.width * 0.6;
    
    this.scene.tweens.add({
      targets: this.highlightEffect,
      alpha: { from: 0.8, to: 0.2 },
      duration: 1000,
      repeat: -1,
      yoyo: true,
      onUpdate: () => {
        this.highlightEffect.clear();
        this.highlightEffect.lineStyle(2, 0x00ff00, this.highlightEffect.alpha);
        this.highlightEffect.strokeCircle(this.x, this.y, radius);
      }
    });
  }
}