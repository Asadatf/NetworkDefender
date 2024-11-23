class NetworkDevice extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);

    var obstacleScale = Math.min(
      this.scale.width / 10000,
      this.scale.height / 10000
    );

    //enable physics
    this.scene.physics.world.enable(this);

    // scale the device
    this.setScale(0.1);
    // collide with world bounds, prevent from leaving world
    this.setCollideWorldBounds(true);
    // add device to existing scene
    this.scene.add.existing(this);
  }
}
