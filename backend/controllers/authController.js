const jwt = require('jsonwebtoken');

// Secret Key should be in .env realistically
const JWT_SECRET = 'super-secret-industry-key';

// Mock DB for users
const users = [
    { id: 1, username: 'admin', password: 'password123', role: 'admin' },
    { id: 2, username: 'user', password: 'password123', role: 'user' }
];

function login(req, res) {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.json({
        success: true,
        token,
        user: { id: user.id, username: user.username, role: user.role }
    });
}

function signup(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    
    const exists = users.find(u => u.username === username);
    if(exists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const newUser = { id: users.length + 1, username, password, role: 'user' };
    users.push(newUser);
    
    const token = jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.status(201).json({
        success: true,
        token,
        user: { id: newUser.id, username: newUser.username, role: newUser.role }
    });
}

module.exports = { login, signup, JWT_SECRET };
