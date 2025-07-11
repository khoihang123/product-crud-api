const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

exports.register = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    User.findByUsername(username, async (err, existingUser) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existingUser) return res.status(409).json({ message: 'Username already taken' });

        const hashedPassword = await bcrypt.hash(password, 10);
        User.create(username, hashedPassword, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
};

exports.login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    User.findByUsername(username, async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
            expiresIn: '1d',
        });

        res.json({ message: 'Login successful', token });
    });
};
