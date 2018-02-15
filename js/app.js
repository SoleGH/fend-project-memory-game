/*
 * Create a list that holds all of your cards
 */
var Game = function () {
    this.cards = [];
    this.openCards = [];
    this.matchCards = [];
    this._move = 0;
    this._time = 0;
    this.timer = null;
    this._result = 1;
};
Game.prototype = {
    init: function () {
        this.logTime();
        this.setResult();
        // attach event listener function to restart button.
        let restart_button = document.getElementsByClassName("restart")[0];
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
                    if (!card.isOpen) {
                        game.openCard(card);
                    }
                };
            }(this);
            this.cards.push(card);
        }
    },
    openCard: function (card) {
        this.setMove(this._move + 1);
        card.open();
        this.openCards.push(card);
        if (this.openCards.length == 2) {
            let card1 = this.openCards[0];
            let card2 = this.openCards[1];
            if (this.match(card1, card2)) {
                this.matchCards.push(card1, card2);
                card1.matched();
                card2.matched();
                if (this.isWin()) {
                    clearTimeout(this.timer);
                    this.socre();
                    let alertStr = "win!!! score is "+this._result;
                    alertStr += " stars,spend "+this._time;
                    alertStr += " seconds . try again?"
                    setTimeout(() => {
                        let feedback = confirm(alertStr);
                        if (feedback) {
                            this.restart();
                        }
                    }, 1000);
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
    restart: function () {
        clearTimeout(this.timer)
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            card.recover();
        }
        this.openCards = [];
        this.matchCards = [];
        this.setMove(0);
        this._time = 0;
        this.setTimes(this._time);
        this.logTime();
        this.setResult();
    },
    //set number that user has moved
    setMove: function (num) {
        this._move = num;
        document.getElementsByClassName("moves")[0].textContent = this._move;
    },
    //match two cards
    match: function (card0, card1) {
        return card0.symbol == card1.symbol;
    },
    //星级评定
    socre: function () {
        if (this._move <= 30) {
            this._result = 3;
        } else if (this._move > 30 && this._move <= 40) {
            this._result = 2;
        } else {
            this._result = 1;
        }
    },
    //页面星星展示
    setResult: function () {
        let stars = document.getElementsByClassName("stars")[0];
        let paras = "";
        for (let i = 0; i < this._result; i++) {
            paras += "<li><i class='fa fa-star'></i></li>";
        }
        stars.innerHTML = paras;
    },
    //定时计数开始
    logTime: function () {
        this._time++;
        this.setTimes(this._time);
        this.timer = setTimeout(() => {
            this.logTime();
        }, 1000);
    },
    //游戏时间展示
    setTimes: function (num) {
        document.getElementsByClassName("times")[0].textContent = num;
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
create a Card object that holds all attributes of card
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

//init game
var game = new Game();
game.init();
