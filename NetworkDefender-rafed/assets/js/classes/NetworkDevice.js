class NetworkDevice extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);

    var obstacleScale = Math.min(
      this.scale.width / 10000,
      this.scale.height / 10000
    );

    // scale the device
    this.setScale(0.1);

    // add device to existing scene
    this.scene.add.existing(this);
  }
}
