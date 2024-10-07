require('dotenv').config(); // Load environment variables first
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');



const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));



// You can import other routes similarly when ready
// Serve static files from the 'frontend/public' folder
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

app.use('/api/service-requests', serviceRequestRoutes);
// Serve the index.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'login.html'));
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
