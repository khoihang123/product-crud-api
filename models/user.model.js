const db = require('../config/db');

exports.create = (username, hashedPassword, callback) => {
    db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        callback
    );
};

exports.findByUsername = (username, callback) => {
    db.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, results) => {
            if (err) return callback(err, null);
            if (results.length === 0) return callback(null, null);
            return callback(null, results[0]);
        }
    );
};
