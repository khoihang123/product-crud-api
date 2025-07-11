const db = require('../config/db');

exports.getAll = (callback) => {
    db.query('SELECT * FROM products', callback);
};

exports.getById = (id, callback) => {
    db.query('SELECT * FROM products WHERE id = ?', [id], callback);
};

exports.create = (data, callback) => {
    const { name, price, description } = data;
    db.query(
        'INSERT INTO products (name, price, description) VALUES (?, ?, ?)',
        [name, price, description],
        callback
    );
};

exports.update = (id, data, callback) => {
    const { name, price, description } = data;
    db.query(
        'UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?',
        [name, price, description, id],
        callback
    );
};

exports.remove = (id, callback) => {
    db.query('DELETE FROM products WHERE id = ?', [id], callback);
};
