class Receiver extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    this.scene = scene;

    //enable physics
    this.scene.physics.world.enable(this);
    // set Immovable
    this.setImmovable(false);
    // scale the defender
    this.setScale(0.15);
    // collide with world bounds, prevent from leaving world
    this.setCollideWorldBounds(true);
    // Flipping towards left
    this.flipX = true;
    // add defender to existing scene
    this.scene.add.existing(this);
  }
}
