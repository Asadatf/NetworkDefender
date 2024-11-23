class Packet extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    this.scene = scene;

    //enable physics
    this.scene.physics.world.enable(this);
    // scale the packet
    this.setScale(0.05);
    // collide with world bounds, prevent from leaving world
    this.setCollideWorldBounds(true);
    // add packet to existing scene
    this.scene.add.existing(this);
  }
}
