/**
 * GameScore abstract a game stars show in game panel.
 * @param {int} maxScore - max score the player can get.
 */
var GameScore = function (maxScore = 3) {
    this._maxScore = maxScore;
    this.score = maxScore;
    this._star_elements = [];
    // add stars HTML.
    let stars = document.getElementById("stars");
    for (let i = 0; i < maxScore; i++) {
        let li = document.createElement("li");
        let star = document.createElement("i");
        star.classList.add("fa", "fa-star");
        this._star_elements.push(star);
        li.appendChild(star);
        stars.appendChild(li);
    }
};
GameScore.prototype = {
    /**
     * @description Reset game score to max score.
     */
    reset: function () {
        this._setScore(this._maxScore);
    },
    /**
     * @description judge how many score the player get according to game moves.
     * @param {int} move - Game had already moved.
     */
    judgeScore: function (move) {
        let score = 1;
        if (move <= 22) {
            score = 3;
        } else if (22 < move <= 35) {
            score = 2;
        }
        this._setScore(score);
    },
    /**
     * @description Set the game score.
     * @param {int} score - score show in the screen.
     */
    _setScore: function (score) {
        this.score = score;
        for (let i = 0; i < this._star_elements.length; i++) {
            const element = this._star_elements[i];
            element.classList.remove("fa-star", "fa-star-o");
            if (i <= score) {
                element.classList.add("fa-star");
            } else {
                element.classList.add("fa-star-o");
            }
        }
    }
};

/**
 * GameTimer abstract a game timer to record how many times expired when the game begin.
 */
var GameTimer = function () {
    this.seconds = 0;
    this._element = document.getElementById("times");
    this._timer = undefined;
    this.isStart = false;
}
GameTimer.prototype = {
    start: function () {
        if (this._timer) {
            throw new GameTimerError("GameTimer: cann't start a game timer when it had already started.");
        } else {
            this._timer = setInterval(() => {
                this._setSeconds(this.seconds + 1);
            }, 1000);
            this.isStart = true;
        }
    },
    stop: function () {
        if (!this._timer) {
            throw new GameTimerError("GameTimer: cann't stop a game timer that is already be stoped.");
        } else {
            clearInterval(this._timer);
            this._timer = undefined;
            this._setSeconds(0);
            this.isStart = false;
        }
    },
    _setSeconds: function (seconds) {
        this.seconds = seconds;
        this._element.textContent = seconds;
    }
};

/**
 * @description GameTimerError throwed when client do some exception action to GameTimer.
 * @param {string} message - error message.
 */
function GameTimerError(message) {
    this.message = message;
};
GameTimerError.prototype = Object.create(Error.prototype);
GameTimerError.prototype.constructor = GameTimerError;

/**
 * Game abstract a game, controll all game action.
 */
var Game = function () {
    this.cards = [];
    this.openCards = [];
    this.matchCards = [];
    this._move = 0;
    this._timer = new GameTimer();
    this._score = new GameScore();
    this.isStart = false;
};
Game.prototype = {
    init: function () {
        // attach event listener function to restart button.
        let restart_button = document.getElementById("restart");
        restart_button.onclick = function (game) {
            return function () {
                game.restart();
            };
        }(this);
        // attach event listener function to cards.
        let cards = document.getElementsByClassName("card");
        for (var i = 0; i < cards.length; i++) {
            let card = new Card(cards[i]);
            card.element.onclick = function (game) {
                return function () {
                    if (!game.isStart) {
                        game.start();
                    }

                    if (!card.isOpen) {
                        game.openCard(card);
                    }
                };
            }(this);
            this.cards.push(card);
        }
        // shuffle the game deck cards.
        this.shuffleCards();
    },
    openCard: function (card) {
        card.open();
        this.openCards.push(card);
        if (this.openCards.length == 2) {
            this.setMove(this._move + 1);
            let card1 = this.openCards[0];
            let card2 = this.openCards[1];
            if (cards_match(card1, card2)) {
                this.matchCards.push(card1, card2);
                card1.matched();
                card2.matched();
                if (this.isWin()) {
                    this.showResult();
                }
            } else {
                setTimeout(() => {
                    card1.close();
                    card2.close();
                }, 1000);
            }
            this.openCards = [];
        }
    },
    isWin: function () {
        return this.cards.length == this.matchCards.length;
    },
    start: function () {
        this._timer.start();
        this.isStart = true;
    },
    /**
     * @description restart reset the game state to init.
     */
    restart: function () {
        this._score.reset();
        this._timer.stop();
        this.setMove(0);
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            card.recover();
        }
        this.openCards = [];
        this.matchCards = [];
        this.isStart = false;
        this.shuffleCards();
    },
    /**
     * @description set number that user has moved.
     * @param {int} num - number of player have moved.
     */
    setMove: function (num) {
        this._move = num;
        document.getElementById("moves").textContent = this._move;
        this._score.judgeScore(num);
    },
    /**
     * @description Show result on the screen.
     */
    showResult: function () {
        let alertStr = "win!!! score is " + this._score.score;
        alertStr += " stars,spend " + this._timer.seconds;
        alertStr += " seconds . try again?"
        let feedback = confirm(alertStr);
        if (feedback) {
            this.restart();
        }
    },
    /**
     * @description shuffle the game deck cards.
     */
    shuffleCards: function () {
        let deck = document.getElementById("deck");
        let shuffled_cards = shuffle([].slice.call(deck.children));
        deck.innerHTML = "";
        for (let i = 0; i < shuffled_cards.length; i++) {
            const new_card = shuffled_cards[i];
            deck.appendChild(new_card);
        }
    }
};

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */


/*
 * Card object holds all attributes of a card.
*/
var Card = function (element) {
    this.element = element;
    this.symbol = element.children[0].classList.value;
    this.isOpen = false;
};
Card.prototype = {
    recover: function () {
        this.isOpen = false;
        this.element.classList.remove("open", "show", "match");
    },
    open: function () {
        this.isOpen = true;
        this.element.classList.add("open", "show");
    },
    close: function () {
        this.isOpen = false;
        this.element.classList.remove("open", "show");
    },
    matched: function () {
        this.element.classList.remove("open", "show");
        this.element.classList.add("match");
    }
};

/**
 * TODO(hexin): AnimateCard add some animate effect to normal Card.
 * @param {HTML element} element
 */
// var AnimateCard = function (element) {
//     Card.call(this, element);
// }
// AnimateCard.prototype = Object.create(Card.prototype);
// AnimateCard.prototype.open = function () {
//     super.open();
// };
// AnimateCard.prototype.close = function () {
//     super.close();
// };
// AnimateCard.prototype.matched = function () {
//     super.matched();
// }
// AnimateCard.prototype.constructor = AnimateCard;

/**
 * @description Whether two cards symbol matched.
 * @param {Card} card1
 * @param {Card} card2
 * @returns {boolean} Return true if two cards symbol is matched else false.
 */
function cards_match(card1, card2) {
    return card1.symbol == card2.symbol;
}

// launcher game
function launcherGame() {
    var game = new Game();
    game.init();
}

launcherGame();

