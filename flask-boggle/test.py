"""Unit tests for Boggle app."""

from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle

class FlaskTests(TestCase):
    def setUp(self):
        """Must create before every test"""
        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_main_page(self):
        with self.client:
            response = self.client.get('/')
            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('nplays'))
            self.assertIn(b'<p>High Score:', response.data)
            self.assertIn(b'Score:', response.data)
            self.assertIn(b'Seconds Left:', response.data)

    def test_valid_word(self):
        with self.client as client:
            with client.session_transaction() as sess:
                sess['board'] = [["C","A","T","T","T"],
                                 ["C","A","T","T","T"],
                                 ["C","A","T","T","T"],
                                 ["C","A","T","T","T"],
                                 ["C","A","T","T","T"]]
        response = self.client.get('/check-word?word=cat')
        self.assertEqual(response.json['result'], 'Word-is-valid')

    def test_invalid_word(self):
        """Test if word is valid"""
        self.client.get('/')
        response = self.client.get('/check-word?word=impossible')
        self.assertEqual(response.json['result'], 'Word-not-in-dictionary')

    def test_not_real(self):  
        self.client.get('/')
        response = self.client.get('/check-word?word=fsjdakfkldsfjdslkfjdlksf')
        self.assertEqual(response.json['result'], 'Word-not-in-dictionary') 
