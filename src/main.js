// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// Cubey
//
// An example of putting sprites on the screen using Phaser
//
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"

// game config
let config = {
  parent: 'phaser-game',
  type: Phaser.CANVAS,
  render: {
    pixelArt: true  // prevent pixel art from getting blurred when scaled
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity: {
        x: 0,
        y: 0
      }
    }
  },
  // width: 1440,
  // height: 900,
  // height: 720,
  width: 800,
  height: 720,
  scene: [Load, Platformer, Platformer2, Platformer3]
}

var cursors;
const SCALE = 2.0;
var my = { sprite: {}, text: {} };
var sounds = {}

const game = new Phaser.Game(config);
