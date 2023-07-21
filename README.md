# Playwright Checkers Test Suite
This was created to test the checkers game: (https://www.gamesforthebrain.com/game/checkers/) 
The suite utilizes Playwright version 1.36.1 and Node version 18.16.1, and uses Playwright's internal test runner and assertion suite.   
The project was setup using Playwright setup documentation in the following link: (https://playwright.dev/docs/intro)

Clone the repo and follow the installation instructions to get started!

# Installation
To get started, install the dependencies using npm.  
```
npm install
```
Once completed install all playwright browsers that will be used to run tests.  

```
npx playwright install
```
# Running the tests
There are two scripts provided to run the tests.  

To the tests cross-broswer use the following command (broswers supported are chrome, firefox, and edge).
```
npm run tests-cross-browser
```

To run the test in chrome-only use the following command.  
```
npm run test
```
