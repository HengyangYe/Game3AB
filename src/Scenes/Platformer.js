/**
 *
 * @param {Phaser.Scene} scene
 * @param {number} tileIndex
 * @returns
 */
const createSprite = (scene, tileIndex, x, y) => {

  // // const rows = 20;
  // // const spriteLen = 18;
  // // // const sprit1Index = 48;
  // // const rowIndex = Math.floor(tileIndex / rows);
  // // const colIndex = tileIndex % rows;
  // // const textureX = spriteLen * colIndex;
  // // const textureY = spriteLen * rowIndex;

  // const sprite = scene.physics.add.sprite(x, y, "tilemap_tiles");
  // sprite.setOrigin(0)
  // sprite.setCrop(textureX, textureY, spriteLen, spriteLen);
  // sprite.setDisplaySize(spriteLen, spriteLen);
  // sprite.body.setSize(spriteLen, spriteLen)
  const sprite = scene.physics.add.sprite(x, y, 'sprite_tiles', tileIndex)
  sprite.setScale(2);

  return sprite;
}

/**
 *
 * @param {Phaser.Scene} scene
 * @param {Phaser.GameObjects.Sprite} player
 * @param {number} x
 * @param {number} y
 */
const createFloorGroup = (scene, player, x, y) => {
  const sprite1 = createSprite(scene, 48, x, y)
  const sprite2 = createSprite(scene, 49, x + 18 * 2, y)
  const sprite3 = createSprite(scene, 50, x + 18 * 4, y)

  const group = scene.physics.add.group();
  group.add(sprite1);
  group.add(sprite2);
  group.add(sprite3);


  group.children.iterate(child => {
    child.body.allowGravity = false
    child.setImmovable(true)
    scene.physics.add.collider(child, player)
    scene.physics.add.existing(child, true);
  });

  scene.tweens.add({
    targets: group.getChildren(),
    x: '+=200',
    ease: 'Linear',
    duration: 1000,
    yoyo: true,
    repeat: -1
  });

  return group;

};

class Platformer extends Phaser.Scene {
  constructor() {
    super("platformerScene");
  }

  init() {
    // variables and settings
    this.ACCELERATION = 500;
    this.DRAG = 700;    // DRAG < ACCELERATION = icy slide
    this.physics.world.gravity.y = 1500;
    this.JUMP_VELOCITY = -900;
  }

  create() {
    // Create a new tilemap game object which uses 18x18 pixel tiles, and is
    // 45 tiles wide and 25 tiles tall.
    this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);

    // Add a tileset to the map
    // First parameter: name we gave the tileset in Tiled
    // Second parameter: key for the tilesheet (from this.load.image in Load.js)
    this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

    // Create a layer
    this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
    this.background = this.map.createLayer("Background", this.tileset, 0, 0);

    this.groundLayer.setScale(2.0);
    this.groundLayer.setDepth(1);
    this.background.setScale(2.0);
    this.background.setDepth(0);

    // Make it collidable
    this.groundLayer.setCollisionByProperty({
      collides: true
    });
    // const spriteGroup = this.physics.add.group()

    // const tile = this.groundLayer.getTileAt(14, 10)
    // console.log(tile, tile.index)
    // const sprite = this.physics.add.sprite(100, 100, 'sprite_tiles', 49)
    // sprite.setScale(2)
    // sprite.body.allowGravity = false


    // set up player avatar
    my.sprite.player = this.physics.add.sprite(game.config.width / 4, game.config.height / 2, "platformer_characters", "tile_0000.png").setScale(SCALE)
    my.sprite.player.setCollideWorldBounds(true);
    my.sprite.player.setDepth(9)

    // Enable collision handling
    this.physics.add.collider(my.sprite.player, this.groundLayer);
    // bound player on horizontal direction

    this.physics.world.setBounds(0, 0, this.sys.game.config.width, this.sys.game.config.height, true, true, false, false)

    this.camera = this.cameras.main;
    this.camera.startFollow(my.sprite.player, true, 0.05, 0.05);
    this.camera.setBounds(0, 0, 1440, 720)

    // set up Phaser-provided cursor key input
    cursors = this.input.keyboard.createCursorKeys();

    this.keys = {};
    this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // debug key listener (assigned to D key)
    this.input.keyboard.on('keydown-D', () => {
      this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
      this.physics.world.debugGraphic.clear()
    }, this);
    this.jumpCount = 0


    let worldX = 0
    let worldY = 0
    const oldGroup = [
      [14, 10],
      [15, 10],
      [16, 10],
    ]
    oldGroup.forEach((pos) => {
      const x = pos[0]
      const y = pos[1]
      const tile = this.groundLayer.getTileAt(x, y)
      this.groundLayer.removeTileAt(x, y)
      if (!worldX && !worldY) {
        worldX = tile.getCenterX()
        worldY = tile.getCenterY()
      }
    })
    createFloorGroup(this, my.sprite.player, worldX, worldY)
  }

  update() {
    if (cursors.left.isDown) {
      // TODO: have the player accelerate to the left
      my.sprite.player.body.setAccelerationX(-this.ACCELERATION);

      my.sprite.player.resetFlip();
      my.sprite.player.anims.play('walk', true);

    } else if (cursors.right.isDown) {
      // TODO: have the player accelerate to the right
      my.sprite.player.body.setAccelerationX(this.ACCELERATION);

      my.sprite.player.setFlip(true, false);
      my.sprite.player.anims.play('walk', true);

    } else {
      // TODO: set acceleration to 0 and have DRAG take over
      my.sprite.player.body.setAccelerationX(0);
      my.sprite.player.body.setDragX(this.DRAG);
      my.sprite.player.anims.play('idle');
    }

    // player jump
    // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
    if (!my.sprite.player.body.blocked.down) {
      my.sprite.player.anims.play('jump');
      if (this.jumpCount <= 1 && Phaser.Input.Keyboard.JustDown(this.keys.space)) {
        my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY / 2);
        this.jumpCount = 2
      }
    } else {
      this.jumpCount = 0
    }
    if (my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.keys.space)) {
      // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
      my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

      this.jumpCount = 1
    }
  }
}
