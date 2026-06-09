from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class KnowledgeBase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    keywords = db.Column(db.String(255), nullable=False)
    response = db.Column(db.Text, nullable=False)


class InteractionLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    query = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)