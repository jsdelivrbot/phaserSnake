window.onload = function() {
  // variables that will hold objects
  var head, tail, cursors, snake, coin, gameText, playerDirection, movementDirection, movingCameraLeft, movingCameraRight, movingCameraUp, movingCameraDown, speedLimit;
  var directions = Object.freeze({up: 0, down: 1, right: 2, left: 3});

  // configuration variables and starting values
  var rows = 20;
  var columns = 20;
  var playerXSize = 40;
  var playerYSize = 40;
  var canvasWidth = playerXSize * columns;
  var canvasHeight = playerYSize * rows;
  var boundWidth = 4288;
  var boundHeight = 2848;
  var x = 0, y = 0;
  var frameCounter = 0;
  var gameSpeed = 7;
  var score = 0;
  movingCameraRight = false;
  movingCameraLeft = false;
  movingCameraDown = false;
  movingCameraUp = false;
  speedLimit = 2;

  // basic phaser preload/create/update functions

  var game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });

  function preload() {
      game.world.setBounds(0, 0, boundWidth, boundHeight);
      game.load.image('castle', 'Assets/Images/castle.jpg');
      game.load.image('snake', 'Assets/Images/snake_segment.png');
      game.load.image('coin', 'Assets/Images/coin_segment.png');
  }

  function create() {
      game.add.sprite(0, 0, 'castle');
      gameText = game.add.text(canvasWidth, 0, "0", {
          font: "28px Arial",
          fill: "#fff"
      });
      gameText.anchor.setTo(1, 0);
      initSnake();
      placeRandomCoin();

      cursors = game.input.keyboard.createCursorKeys();
  }

  function update() {
    updateCamera();
      gameText.text = score;
      frameCounter++;
      updateDirection();
      if (frameCounter >= gameSpeed &&
          movingCameraRight === false &&
          movingCameraLeft === false &&
          movingCameraDown === false &&
          movingCameraUp === false) {
          movePlayer();
          if (playerCollidesWithSelf()) {
              gameOver();
          }
          if (coinCollidesWithSnake()) {
              score++;
              coin.destroy();
              placeRandomCoin();
              gameSpeed--;
              if (gameSpeed <= speedLimit) gameSpeed = speedLimit;
          } else if (playerDirection != undefined) {
              removeTail();
          }
          frameCounter = 0;
      }
  }

  // helper functions

  function initSnake() {
      head = new Object();
      newHead(0, 0);
      tail = head;
      newHead(playerXSize, 0);
      newHead(playerXSize * 2, 0);
      x = playerXSize * 2;
      y = 0;
  }

  function deleteSnake() {
      while (tail != null) {
          tail.image.destroy();
          tail = tail.next;
      }
      head = null;
  }

  function placeRandomCoin() {
      if (coin != undefined) coin.destroy();
      coin = game.add.image(0, 0, 'coin');
      do {
          coin.position.x = Math.floor(Math.random() * 13) * 40;
          coin.position.y = Math.floor(Math.random() * 10) * 40;
      } while (coinCollidesWithSnake());
  }

  // linked list functions

  function newHead(x, y) {
      var newHead = new Object();
      newHead.image = game.add.image(x, y, 'snake');
      newHead.next = null;
      head.next = newHead;
      head = newHead;
  }

  function removeTail(x, y) {
      tail.image.destroy();
      tail = tail.next;
  }

  // collision functions

  function coinCollidesWithSnake() {
      // traverse the linked list, starting at the tail
      var needle = tail;
      var collides = false;
      var numTimes = 0;
      while (needle != null) {
          numTimes++;
          if (coin.position.x == needle.image.position.x && 
              coin.position.y == needle.image.position.y) {
              collides = true;
          }
          needle = needle.next;
      }
      return collides;
  }

  function playerCollidesWithSelf() {
      // check if the head has collided with any other body part, starting at the tail
      var needle = tail;
      var collides = false;
      while (needle.next != head) {
          if (needle.image.position.x == head.image.position.x &&
              needle.image.position.y == head.image.position.y) {
              collides = true;
          }
          needle = needle.next;
      }
      return collides;
  }

  // movement functions

  function updateDirection() {
      if (cursors.right.isDown && movementDirection != directions.left) {
          playerDirection = directions.right;
      }
      if (cursors.left.isDown && movementDirection != directions.right) {
          playerDirection = directions.left;
      }
      if (cursors.up.isDown && movementDirection != directions.down) {
          playerDirection = directions.up;
      }
      if (cursors.down.isDown && movementDirection != directions.up) {
          playerDirection = directions.down;
      }
  }

  function movePlayer() {
      if (playerDirection == directions.right) {
          x += playerXSize;
          movementDirection = directions.right;
      } else if (playerDirection == directions.left) {
          x -= playerXSize;
          movementDirection = directions.left;
      } else if (playerDirection == directions.up) {
          y -= playerYSize;
          movementDirection = directions.up;
      } else if (playerDirection == directions.down) {
          y += playerYSize;
          movementDirection = directions.down;
      }
      if (x <= 0 - playerXSize|| x >= boundWidth || y <= 0 - playerYSize || y >= boundHeight) {
          gameOver();
      }

      if (playerDirection != undefined) {
          newHead(x, y);
      }
  }

  function gameOver() {
      alert("The game is over! Your score was: " + score);
      deleteSnake();
      initSnake();
      score = 0;
      gameSpeed = 10;
      playerDirection = undefined;
      gameText.text = "";
  }

  function updateCamera() {
    if (x - game.camera.x >= canvasWidth) {
      movingCameraRight = true;
    }

    else if (x < game.camera.x) {
        movingCameraLeft = true;
    }

    else if (y - game.camera.y >= canvasHeight) {
        movingCameraDown = true;
    }

    else if (y < game.camera.y) {
        movingCameraUp = true;
    }

    if (movingCameraRight === true) {
        game.camera.x = game.camera.x + 20

        if (x === game.camera.x || game.camera.x  === boundWidth - canvasWidth) {
            movingCameraRight = false;
        }
    }

    else if (movingCameraLeft === true) {
        game.camera.x = game.camera.x - 20

        if (x - game.camera.x === canvasWidth || game.camera.x === 0) {
            movingCameraLeft = false;
        }
    }

    else if (movingCameraDown === true) {
        game.camera.y = game.camera.y + 20

        if (y === game.camera.y || game.camera.y === boundHeight - canvasHeight) {
            movingCameraDown = false;
        }
    }

    else if (movingCameraUp === true) {
        game.camera.y = game.camera.y - 20

        if (y - game.camera.y === canvasHeight || game.camera.y === 0) {
            movingCameraUp = false;
        }
    }
    gameText.x = game.camera.x + canvasWidth;
    gameText.y = game.camera.y;
  }
}