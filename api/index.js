const mainHandler = require('../dist/main.js');

module.exports = async (req, res) => {
  try {
    // Si el main.js exporta un default, usarlo
    if (mainHandler.default) {
      return await mainHandler.default(req, res);
    }
    // Si no, intentar usar el módulo directamente
    return await mainHandler(req, res);
  } catch (error) {
    console.error('Error in API handler:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
