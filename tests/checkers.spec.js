const { test, expect } = require("@playwright/test");
const { BasePage } = require("../pages/base.page");
const { BoardPage } = require("../pages/board.page");

//game will end when the user makes 5 moves and has taken 1 piece from the opponent.
//Goal is to ensure the board loads correctly
//Verify the transition messages appear correctly
//Verify the user is able to move correctly between spaces
test.only("play full game", async ({ page }) => {
  const basePage = new BasePage(page);
  const boardPage = new BoardPage(page);
  //Set variables needed for test
  let board = {};
  let originalBoard = {};
  let moveCount = 0;
  let piecesTaken = 0;

  //navigate to page
  await page.goto("/game/checkers/", {
    waitUntil: "domcontentloaded",
  });

  //verify the page is loaded and ready for gameplay
  await basePage.assertFreshPage();

  //locate the squares on the board, and get their attributres.  Set originalboard to board for later verfication.
  board = await boardPage.createBoardObject();
  originalBoard = board;

  //Start game control loop to exit after 5 moves and taking an opponents piece.
  while (piecesTaken < 1 || (piecesTaken >= 1 && moveCount <= 5)) {
    console.log("moveCount: ", moveCount);
    let gameResult = playGame(board);
    console.log("gameResult", gameResult);

    //if its open, make the movement on the screen
    if (gameResult.canMove[0]) {
      if (
        gameResult.availablePiecesToMove[gameResult.currentIndex].details ===
        "opponent"
      ) {
        piecesTaken++;
      }

      await boardPage.clickSpace(gameResult.currentIndex);
      await boardPage.clickSpace(gameResult.newIndex);

      //Need this wait step in here or the loop executes too fast, revisit
      await page.waitForTimeout(3000);
    }

    //Wait for my turn to move
    let text = await page.locator("#message").innerText();
    await basePage.waitForMessage(text);

    //recreate the board after opponent makes their move
    board = await boardPage.createBoardObject();

    //Game flow, only count the iteration if there was a move made
    if (gameResult.canMove[0]) {
      moveCount++;
    }
  }

  console.log("moveCount: ", moveCount);
  console.log("piecesTaken: ", piecesTaken);

  //After exiting the gameplay loop, Restart the game
  await basePage.resetBoard();

  //After restart wait for page to reload
  await page.waitForLoadState("domcontentloaded");

  //assert the page is reloaded
  await basePage.assertFreshPage();

  //Recreate the board
  board = await boardPage.createBoardObject();

  //Assert the board is reset to the orginal state after reload
  expect(originalBoard).toStrictEqual(board);
});

function canMoveHere(newSquare) {
  let squareAttributes = [];
  if (newSquare === "https://www.gamesforthebrain.com/game/checkers/me1.gif") {
    //console.log('can move here, take the piece');
    squareAttributes.push(true);
    squareAttributes.push("opponent");
    return squareAttributes;
  } else if (
    newSquare === "https://www.gamesforthebrain.com/game/checkers/black.gif"
  ) {
    //console.log('can move here');
    squareAttributes.push(true);
    squareAttributes.push("black");
    return squareAttributes;
  } else if (
    newSquare === "https://www.gamesforthebrain.com/game/checkers/gray.gif"
  ) {
    //console.log('can move here');
    squareAttributes.push(true);
    squareAttributes.push("gray");
    return squareAttributes;
  } else if (
    newSquare === "https://www.gamesforthebrain.com/game/checkers/you1.gif"
  ) {
    //console.log('cannot move here');
    squareAttributes.push(false);
    squareAttributes.push("mypiece");
    return squareAttributes;
  }
}

function availableToMove(board) {
  const myPieces = {};
  for (const property in board) {
    if (
      board[property] ===
      "https://www.gamesforthebrain.com/game/checkers/you1.gif"
    ) {
      let moveLeft = canMoveHere(board[Number(property) + 11]);
      let moveRight = canMoveHere(board[Number(property) - 9]);
      if (moveLeft && moveLeft[0]) {
        myPieces[property] = {
          direction: "left",
          details: moveLeft[1],
        };
      }
      if (moveRight && moveRight[0]) {
        myPieces[property] = {
          direction: "right",
          details: moveRight[1],
        };
      }
    }
  }
  return myPieces;
}

function moveDirection(direction, details) {
  if (direction === "left") {
    if (details === "opponent") {
      return 22;
    }
    return 11;
  } else if (direction === "right") {
    if (details === "opponent") {
      return -18;
    }
    return -9;
  }
}

function playGame(board) {
  let currentSquare;
  let newSquare;
  let currentIndex;
  let newIndex;
  let newMove;
  let availablePiecesToMove = {};

  availablePiecesToMove = availableToMove(board);
  //console.log(availablePiecesToMove);

  //filter the available to move object to look for opponents pieces and set them as priority movements
  const priorityMoves = Object.fromEntries(
    Object.entries(availablePiecesToMove).filter(
      ([key, value]) => value.details === "opponent"
    )
  );

  //console.log("priorityMoves:", priorityMoves);

  //if there are opponents pieces to take, try them first
  if (priorityMoves) {
    currentIndex = Object.keys(availablePiecesToMove)[0];
  }

  //if there are not, randomly select an available move
  else {
    let objectIndex = Math.floor(
      Math.random() * Object.keys(availablePiecesToMove).length
    );
    currentIndex = Object.keys(availablePiecesToMove)[objectIndex];
  }

  //After randomly selecting a move, calculate where the piece needs to move to
  newMove = moveDirection(
    availablePiecesToMove[currentIndex].direction,
    availablePiecesToMove[currentIndex].details
  );
  newIndex = Number(currentIndex) + newMove;
  let formattedNewIndex = newIndex.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  });

  //pass in value to see if that spot is open to be moved to
  newSquare = board[newIndex];
  let canMove = canMoveHere(newSquare);
  /*console.log(
    "move1",
    newMove,
    newIndex,
    currentIndex,
    currentSquare,
    newSquare
  );*/
  return {
    canMove: canMove,
    currentIndex: currentIndex,
    newIndex: formattedNewIndex,
    availablePiecesToMove: availablePiecesToMove,
  };
}
