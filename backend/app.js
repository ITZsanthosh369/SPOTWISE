const express = require('express');
const path = require('path'); // Import the path module

const app = express();

// Serve static files from the 'frontend/public' folder
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Serve the index.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'index.html'));
});

app.listen(3000, () => {
    console.log('App listening on port 3000');
});
   