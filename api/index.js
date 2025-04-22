const path = require('path');
const { createServer } = require('http');
const { parse } = require('url');

// Import the app instead of server
const app = require('../server/app');

// Create a simple proxy to the Express app
module.exports = async (req, res) => {
    // Get the parsed URL
    const parsedUrl = parse(req.url, true);

    // Handle the request with the Express app
    const server = createServer(app);
    server.listen(0, () => {
        const socketPath = server._handle.fd;
        req.connection.server = server;

        // Pass the request to the Express app
        app(req, res);
    });
}; 