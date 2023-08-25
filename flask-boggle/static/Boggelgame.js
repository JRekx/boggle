class BoggleGame {

    constructor(boardId, secs = 60) {
        // Constructor initializes the game with given time limit and displays the timer.
        this.secs = secs;
        this.showTimer();

        // Initialize score, set of found words, and select game board element using the provided board ID.
        this.score = 0;
        this.words = new Set();
        this.board = $('#' + boardId);

        // Set up timer interval that calls the tick function every second.
        this.timer = setInterval(this.tick.bind(this), 1000);

        // Bind the handleSubmit function to the form submission event.
        $('.add-word', this.board).on('submit', this.handleSubmit.bind(this));
    }

    showWord(word) {
        // Display a found word by appending it as a list item within the words list on the game board.
        $('.words', this.board).append($('<li>', { text: word }));
    }

    showScore() {
        // Update the displayed score on the game board with the current score value.
        $('.score', this.board).text(this.score);
    }

    showMessage(msg, cls) {
        // Display a message on the game board and apply appropriate CSS class for styling.
        $('.msg', this.board)
            .text(msg)
            .removeClass()
            .addClass(`msg ${cls}`);
    }

    async handleSubmit(evt) {
        evt.preventDefault();
        const $word = $('.word', this.board);
        let word = $word.val();
        if (!word) return;

        if (this.words.has(word)) {
            // Display an error message if the word has already been used.
            this.showMessage(`${word} HAS BEEN USED`, 'Try again!');
            return;
        }
        const serverResp = await axios.get('/check-word', { params: { word: word } });
        if (serverResp.data.result === "not-word") {
            // Display an error message if the word is not valid.
            this.showMessage(`${word} is not a word!`, `Try again!`);
        } else if (serverResp.data.result === "not-on-board") {
            // Display an error message if the word is not on the board.
            this.showMessage(`${word} is not on the board!`, `Try again!`);
        } else {
            // Add a valid word to the list of found words, update the score, and display a success message.
            this.showWord(word);
            this.score += word.length;
            this.showScore();
            this.words.add(word);
            this.showMessage(`Added: ${word}`, `GOOD JOB!`);
        }

        $word.val("").focus();
    }

    showTimer() {
        // Display the remaining time on the game board.
        $(".timer", this.board).text(this.secs);
    }

    async tick() {
        // Decrement the remaining time by 1 second, update the timer display, and trigger scoring if time is up.
        this.secs -= 1;
        this.showTimer();
        if (this.secs === 0) {
            clearInterval(this.timer);
            await this.scoreGame();
        }
    }

    async scoreGame() {
        // Hide the word submission form, post the score to the server, and display the result message.
        $(".add-word", this.board).hide();
        const resp = await axios.post("/post-score", { score: this.score });
        if (resp.data.brokeRecord) {
            this.showMessage(` ${this.score} is a new record!`, "Good job!");
        } else {
            this.showMessage(`Final Score: ${this.score}`, "Play again?");
        }
    }
}

// Create an instance of BoggleGame
$(function () {
    new BoggleGame("boggle", 60);
});
