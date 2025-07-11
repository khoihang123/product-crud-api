const Product = require('../models/product.model');

exports.getAllProducts = (req, res) => {
    Product.getAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getProductById = (req, res) => {
    const id = req.params.id;
    Product.getById(id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(results[0]);
    });
};

exports.createProduct = (req, res) => {
    Product.create(req.body, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: results.insertId, ...req.body });
    });
};

exports.updateProduct = (req, res) => {
    const id = req.params.id;
    Product.update(id, req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Updated successfully' });
    });
};

exports.deleteProduct = (req, res) => {
    const id = req.params.id;
    Product.remove(id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
};
