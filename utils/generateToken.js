const jwt = require('jsonwebtoken');

// Genera un token JWT
const generateToken = (id, rol) => {
    return jwt.sign({ id, rol }, process.env.JWT_SECRET, {
        expiresIn: '1h', // El token expira en 1 hora
    });
};

module.exports = generateToken;
