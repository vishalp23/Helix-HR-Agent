import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from datetime import timedelta
from dotenv import load_dotenv  

# Load environment variables from .env file
load_dotenv()

# ✅ Import HelixAgent and Database Models
from agent.helix_agent import HelixAgent
from routes.auth import auth_bp
from routes.message import message_bp
from routes.execute_task import execute_task_bp
from socket_events.events import register_socket_events  # ✅ Ensure it accepts 2 params now
from database.models import db, User, UserSection, Sequence  
from database.db_setup import ensure_db_exists, connect_and_create_table

# Initialize Flask App
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, methods=["GET", "POST", "OPTIONS"], supports_credentials=True)

# **Database Connection Parameters from .env**
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
SECRET_KEY = os.getenv("SECRET_KEY")

# Configure PostgreSQL URI for SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = SECRET_KEY  # Flask Secret Key

# Initialize Extensions
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*", ping_interval=25, ping_timeout=60)

# ✅ Initialize HelixAgent with socketio
helix_agent = HelixAgent(socketio_instance=socketio)

# Register HTTP Routes
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(message_bp, url_prefix="/api")
app.register_blueprint(execute_task_bp, url_prefix="/api")

# ✅ Register Socket.IO Events with HelixAgent
register_socket_events(socketio, helix_agent)

# ✅ Ensure Database Setup
with app.app_context():
    ensure_db_exists(DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
    connect_and_create_table(DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
    
    # ✅ Only create tables if they don’t exist (Prevents redefinition errors)
    db.create_all()
    print("✅ Database setup complete and tables created successfully.")

# ✅ Authentication Routes
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name, email, company, role, password = data.get('name'), data.get('email'), data.get('company'), data.get('role'), data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    new_user = User(name=name, email=email, company=company, role=role, password=password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email, password = data.get('email'), data.get('password')
    user = User.query.filter_by(email=email).first()
    
    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=email, expires_delta=timedelta(hours=1))
        return jsonify({'message': 'Login successful', 'email': email, 'token': access_token}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

# ✅ Start Server
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
