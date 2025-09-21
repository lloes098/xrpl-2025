"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = exports.requestLogger = exports.cors = void 0;
/**
 * CORS 미들웨어
 */
const cors = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
};
exports.cors = cors;
/**
 * 요청 로거 미들웨어
 */
const requestLogger = (req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
};
exports.requestLogger = requestLogger;
/**
 * 에러 처리 미들웨어
 */
const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env['NODE_ENV'] === 'development' ? err.message : 'Something went wrong'
    });
};
exports.errorHandler = errorHandler;
/**
 * 404 처리 미들웨어
 */
const notFound = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
};
exports.notFound = notFound;
//# sourceMappingURL=auth.js.map