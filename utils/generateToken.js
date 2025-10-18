//============================================================================
// UTILIDAD PARA GENERAR TOKENS JWT
//============================================================================= 

const jwt = require('jsonwebtoken');

// Genera un token JWT
const generateToken = (id, rol) => {
    return jwt.sign({ id, rol }, process.env.JWT_SECRET, {
        expiresIn: '1h', 
    });
};

module.exports = generateToken;
