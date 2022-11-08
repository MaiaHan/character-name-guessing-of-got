/**
 * Name: Maia Han
 * Date: 11/1, 2022
 * Section: CSE 154 AC
 * This is the JavaScript for the game of GOT
 */

/* global Set */
"use strict";
(function() {
  const URL = "https://www.anapioficeandfire.com/api/characters";
  let timerId;
  let remainingSeconds;
  let charInfo;
  let guessCollection;

  window.addEventListener("load", init);

  /**
   * an init function add click function(change views) to start-btn and back-btn
   */
  function init() {
    let startBtn = id("start-btn");
    let backBtn = id("back-btn");
    let hintBtn = id("hint");
    let subBtn = id("submit");
    let showBtn = id("show");
    startBtn.addEventListener("click", startGame);
    backBtn.addEventListener("click", endGameByClick);
    hintBtn.addEventListener("click", useAHint);
    subBtn.addEventListener("click", compareAnswer);
    showBtn.addEventListener("click", () => {
      id("prompt").textContent = charInfo.name;
      subBtn.disabled = true;
      id("result-box").textContent = "Get a new character!";
    });
    showBtn.disabled = true;
  }

  /**
   * call all needed functions when to start a game
   */
  function startGame() {
    // timer starts
    startTimer();
    toggleViews(); // show game screens
    let refBtn = id("refresh-btn");
    refBtn.addEventListener("click", getNew);
    makeRequest();
    guessCollection = [];
    id("user-guess").value = "";
  }

  /**
   * get a new character
   */
  function getNew() {
    guessCollection = [];
    makeRequest();
    id("user-guess").value = "";
    id("hint-left").textContent = 3;
    id("hint").disabled = false;
    id("result-box").textContent = "";
    id("show").disabled = true;
    id("submit").disabled = false;
  }

  /**
   * get a new hint
   */
  function useAHint() {
    let hintCount = id("hint-left");
    let num = parseInt(hintCount.textContent);
    if (num === 3) {
      id("prompt").textContent = "Gender is " + charInfo.gender;
      hintCount.textContent = num - 1;
    } else if (num === 2) {
      if (charInfo.name.length < 2) {
        id("prompt").textContent = "We don't know the family name yet";
      } else {
        let nameToken = charInfo.name.split(" ");
        id("prompt").textContent =
          "Family name is " + nameToken[nameToken.length - 1];
      }
      hintCount.textContent = num - 1;
    } else {
      if (charInfo.titles[0].length > 0) {
        id("prompt").textContent = "Title: " + charInfo.titles;
      } else {
        id("prompt").textContent = "Has no title";
      }
      id("hint").disabled = true;
      hintCount.textContent = num - 1;
    }
    if (num === 1) {
      id("show").disabled = false;
    }
  }

  /**
   * get a new character's aliase and add the string to the textcontent
   * @param {object} response a new fetched response of a new character's information
   */
  function getAliases(response) {
    let prompt = id("prompt");
    charInfo = response;
    if (response.aliases[0].length > 0) {
      charInfo = response;
      prompt.textContent = 'Aliase: "' + response.aliases[0] + '"';
      console.log(charInfo);
    } else {
      makeRequest();
    }
  }

  /**
   * compare the user input guess with the true name of the character
   */
  function compareAnswer() {
    let usrInput = id("user-guess");
    if (guessCollection.includes(usrInput.value)) {
      id("result-box").textContent = "This name was guessed before!";
    } else {
      guessCollection.push(usrInput.value);
      if (usrInput.value === charInfo.name) {
        id("prompt").textContent = "Correct! " + charInfo.name;
        let num = parseInt(id("count").textContent);
        id("count").textContent = num + 1;
        setTimeout(getNew, 1500);
      } else {
        id("result-box").textContent = "Try again!";
        setTimeout(() => {
          id("result-box").textContent = "";
        }, 1000);
      }
    }
  }

  /**
   * exit the game
   */
  function endGameByClick() {
    clearInterval(timerId); // clean the timer
    toggleViews(); // back to the menu view
    let setNum = id("count");
    setNum.textContent = 0;
    id("hint-left").textContent = 3;
    id("refresh-btn").disabled = false;
    id("hint").disabled = false;
  }

  /**
   * Used to switch between the menu view and game view of the game
   */
  function toggleViews() {
    let gameView = document.getElementById("game-view");
    let menuView = document.getElementById("menu-view");
    gameView.classList.toggle("hidden");
    menuView.classList.toggle("hidden");
  }

  /**
   * Updates the photos displayed on the page based on the current pet selection, fetching the
   * photos from the AJAX Pets API.
   */
  function makeRequest() {
    let index = Math.floor(Math.random() * 2138) + 1;
    fetch(URL + "/" + index)
      .then(statusCheck)
      .then((resp) => resp.json())
      .then(getAliases)
      .catch(handleError);
  }

  /**
   * Provides a message to the user when something goes wrong with a request.
   */
  function handleError() {
    id("prompt").textContent = "Need to pick a new character";
  }

  /* ------------------------------ Helper Functions  ------------------------------ */

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Helper method for getting element by id
   * @param {String} elementID - the id with which the target objects are attached to
   * @return {Object} the DOM element object with the specified id
   */
  function id(elementID) {
    return document.getElementById(elementID);
  }

  /**
   * Starts the timer for a new game. No return value.
   */
  function startTimer() {
    remainingSeconds = document.querySelector("option:checked").value;
    if (remainingSeconds === "60") {
      document.getElementById("time").textContent = "01:00";
    } else if (remainingSeconds === "180") {
      document.getElementById("time").textContent = "03:00";
    } else {
      document.getElementById("time").textContent = "05:00";
    }
    remainingSeconds--;
    timerId = setInterval(advanceTimer, 1000);
  }

  /**
   * Updates the game timer (module-global and #time shown on page) by 1 second.
   * No return value.
   */
  function advanceTimer() {
    let minutes = Math.floor(remainingSeconds / 60);
    let seconds = remainingSeconds % 60;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    document.getElementById("time").textContent = minutes + ":" + seconds;
    if (remainingSeconds > 0) {
      remainingSeconds--;
    } else {
      clearInterval(timerId); // timer be cleared;
      id("refresh-btn").disabled = true;
      id("hint").disabled = true;
      id("show").disabled = false;
      id("submit").disabled = true;
      id("result-box").textContent = "";
      id("input").value = "";
    }
  }
})();
