// Import express module
const express = require('express');
const app = express();

const port = 3000;

// Define a GET route for root URL
app.get('/', (req, res) => {
    res.send('<h1 style="color:green;font-family:Arial">Hello, World!</h1>');
});

// Start the server
app.listen(port, () => {
console.log(`Server is listening at http://localhost:${port}`);
});