const { test, expect } = require("@playwright/test");
const { BasePage } = require("../pages/base.page");

exports.BoardPage = class BoardPage extends BasePage {
  constructor(page) {
    super(page);
  }

  //This creates the board object that will be used for each round of gameplay.
  async createBoardObject() {
    let board = {};
    let imgs = await this.page.$$eval(".line img[src]", (imgs) =>
      imgs.map((img) => img.src)
    );
    let names = await this.page.$$eval(".line img[name]", (item) =>
      item.map((item) => item.name.replace(/space/, ""))
    );

    names.forEach((k, i) => {
      board[k] = imgs[i];
    });

    return board;
  }

  async clickSpace(spaceNum) {
    console.log(spaceNum);
    await this.page.click("[name=space" + spaceNum + "]");

    //TODO: need to ensure click was registered by targeting the src change when the click happens.
    //When clicking on a square the src changes, and makes the square looking highlighted.
    let temp = await this.page.locator("[name=space" + spaceNum + "]");
    console.log(temp);
  }
};
