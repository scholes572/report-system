from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS
from werkzeug.security import generate_password_hash , check_password_hash
from datetime import datetime, timedelta
import os

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///leave_management.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
jwt = JWTManager(app)

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

@app.before_request
def log_request_info():
    print(f"Request: {request.method} {request.url}")
    print(f"Origin: {request.headers.get('Origin')}")
    print(f"Headers: {dict(request.headers)}")

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='employee')
    leave_requests = db.relationship('LeaveRequest', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role
        }
    

class LeaveRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'reason': self.reason,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
    
#Auth Routes

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    hashed_password = generate_password_hash(data['password'])
    role = data.get('role', 'employee')
    
    if role not in ['admin', 'employee']:
        role = 'employee'
    
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password,
        role=role
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully',
        'user': new_user.to_dict()
    }), 201



@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(
        identity=user.id,
        additional_claims={'role': user.role}
    )
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

# Leave Request Routes
@app.route('/leaves', methods=['POST'])
@jwt_required()
def create_leave_request():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('start_date') or not data.get('end_date') or not data.get('reason'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not data['reason'].strip():
        return jsonify({'error': 'Reason cannot be empty'}), 400
    
    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        if end_date < start_date:
            return jsonify({'error': 'End date must be after start date'}), 400
        
        if start_date < datetime.now().date():
            return jsonify({'error': 'Start date cannot be in the past'}), 400
            
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    new_request = LeaveRequest(
        user_id=current_user_id,
        start_date=start_date,
        end_date=end_date,
        reason=data['reason'].strip()
    )
    
    db.session.add(new_request)
    db.session.commit()
    
    return jsonify({
        'message': 'Leave request created successfully',
        'leave_request': new_request.to_dict()
    }), 201


@app.route('/leaves', methods=['GET'])
@jwt_required()
def get_leave_requests():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get('role')
    
    if role == 'admin':
        # Admin can see all requests made
        requests = LeaveRequest.query.order_by(LeaveRequest.created_at.desc()).all()
    else:
        # Employee can see only their own requests
        requests = LeaveRequest.query.filter_by(user_id=current_user_id).order_by(LeaveRequest.created_at.desc()).all()
    
    return jsonify({
        'leave_requests': [req.to_dict() for req in requests]
    }), 200


@app.route('/leaves/<int:leave_id>/status', methods=['PATCH'])
@jwt_required()
def update_leave_status(leave_id):
    claims = get_jwt()
    role = claims.get('role')
    
    if role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('status'):
        return jsonify({'error': 'Status is required'}), 400
    
    status = data['status']
    if status not in ['approved', 'rejected', 'pending']:
        return jsonify({'error': 'Invalid status'}), 400
    
    leave_request = LeaveRequest.query.get(leave_id)
    
    if not leave_request:
        return jsonify({'error': 'Leave request not found'}), 404
    
    leave_request.status = status
    db.session.commit()
    
    return jsonify({
        'message': f'Leave request {status}',
        'leave_request': leave_request.to_dict()
    }), 200

# Initialize database and create default admin
def init_db():
    with app.app_context():
        db.create_all()

        # Create default admin if not exists
        admin = User.query.filter_by(email='agostinoscholes572@gmail.com').first()
        if not admin:
            admin = User(
                name='Agostino Scholes',
                email='agostinoscholes572@gmail.com',
                password=generate_password_hash('Scholes2006'),
                role='admin'
            )
            db.session.add(admin)
            db.session.commit()
            print('✅ Default admin created: agostinoscholes572@gmail.com / Scholes2006')
        else:
            print('✅ Admin account already exists')
    
# Root route for testing
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Leave Management System API',
        'status': 'running',
        'endpoints': {
            'auth': ['/auth/register', '/auth/login'],
            'leaves': ['/leaves', '/leaves/<id>/status']
        }
    }), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
