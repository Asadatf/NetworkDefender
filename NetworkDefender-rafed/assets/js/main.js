var config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 1024,
    scene:{
        preload: preload,
        create: create,
        update: update,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        }
    },

}

var game = new Phaser.Game(config);

function preload (){
    this.load.image('background', 'assets/images/background.jpeg');
    this.load.image('defender', 'assets/images/defender.png');
}

function create (){

    // Background
    var background = this.add.image(0,0, 'background');
    background.setOrigin(0,0);


    // Craeting Game Avatar
    this.defender = this.physics.add.image(100, 100, 'defender');
    this.defender.setCollideWorldBounds(true);
    this.defender.setScale(0.15);

    // Adding keyboard inputs
    this.cursors = this.input.keyboard.createCursorKeys();
}

function update (){
    this.defender.body.setVelocity(0);

    if (this.cursors.left.isDown){
        this.defender.body.setVelocityX(-250);
        this.defender.flipX = true;
    }
    else if (this.cursors.right.isDown){
        this.defender.body.setVelocityX(250);
        this.defender.flipX = false;
    }
    else{
        //console.log('neither');
    }



    if (this.cursors.up.isDown){
        this.defender.body.setVelocityY(-250);
    }
    else if (this.cursors.down.isDown){
        this.defender.body.setVelocityY(250);
    }
    else{
        //console.log('neither');
    }
}