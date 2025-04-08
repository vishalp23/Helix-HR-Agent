# db_init.py
from app import app  # your Flask app entry point
from models import db  # your SQLAlchemy instance (and models imported in models.py)

with app.app_context():
    db.create_all()
    print("Database tables created successfully.")
