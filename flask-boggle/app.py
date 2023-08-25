"""Flask app for Boggle game."""

from flask import Flask, request, render_template, jsonify, session
from boggle import Boggle  # Import your Boggle class

app = Flask(__name__)
app.config['SECRET_KEY'] = 'rosabarks'
boggle_game = Boggle()

@app.route("/")
def homepage():
    """Shows the board"""
    board = boggle_game.make_board()
    session['board'] = board
    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)
    return render_template("index.html", board=board, highscore=highscore, nplays=nplays)

@app.route("/check-word")
def check_word():
    """Check to see if word is real"""
    word = request.args["word"]
    board = session["board"]
    resp = boggle_game.check_valid_word(board, word)
    return jsonify({'result': resp})

@app.route("/post-score", methods=["POST"])
def post_score():
    """Receives scores"""
    score = request.json["score"]
    highscore = session.get('highscore', 0)
    nplays = session.get('nplays', 0)

    session['nplays'] = nplays + 1
    session['highscore'] = max(score, highscore)
    return jsonify(brokeRecord=score > highscore)
