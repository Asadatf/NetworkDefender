class Defender extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    this.scene = scene;
    this.velocity = 250;

    //enable physics
    this.scene.physics.world.enable(this);
    // set Immovable
    this.setImmovable(false);
    // scale the defender
    this.setScale(0.15);
    // collide with world bounds, prevent from leaving world
    this.setCollideWorldBounds(true);
    // add defender to existing scene
    this.scene.add.existing(this);
  }

  update(keys, menuActive) {
    this.body.setVelocity(0);

    if (keys.a.isDown && !menuActive) {
      this.body.setVelocityX(-this.velocity); // Move left
      this.flipX = true; // Flip sprite to face left
    } else if (keys.d.isDown && !menuActive) {
      this.body.setVelocityX(this.velocity); // Move right
      this.flipX = false; // Flip sprite to face right
    }

    if (keys.w.isDown && !menuActive) {
      this.body.setVelocityY(-this.velocity); // Move up
    } else if (keys.s.isDown && !menuActive) {
      this.body.setVelocityY(this.velocity); // Move down
    }
  }
}
