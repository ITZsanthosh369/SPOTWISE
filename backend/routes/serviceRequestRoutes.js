const express = require('express');
const { createRequest, getActiveRequests, acceptRequest, completeRequest, getRequestHistory } = require('../controllers/serviceRequestController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a new service request (only seekers)
router.post('/create', authMiddleware, createRequest);

// Route to fetch active requests (only providers)
router.get('/active', authMiddleware, getActiveRequests);

// Route to accept a service request (only providers)
router.patch('/accept/:id', authMiddleware, acceptRequest);

// Route to mark request as completed (with PIN verification)
router.patch('/complete/:id', authMiddleware, completeRequest);

// Route to get request history (for both seekers and providers)
router.get('/history', authMiddleware, getRequestHistory);

module.exports = router;
