class NetworkDevice extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);

    var obstacleScale = Math.min(
      this.scale.width / 10000,
      this.scale.height / 10000
    );

    // scale the device
    this.setScale(0.1);

    // Set type
    this.type = key;

    // add device to existing scene
    this.scene.add.existing(this);
  }

  highlight(isHighlighted) {
    if (isHighlighted) {
      this.setTint(0xffff00); // Yellow tint for highlight
    } else {
      this.clearTint(); // Remove highlight
    }
  }
}
