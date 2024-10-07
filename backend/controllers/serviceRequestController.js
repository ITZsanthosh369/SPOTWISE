const ServiceRequest = require('../models/ServiceRequestModel');
const User = require('../models/UserModel');

// Create a new service request
exports.createRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(userId)
        const { category, description, contactNumber, location, duration, additionalDetails } = req.body;
        
        // Ensure user is a seeker
        if (req.user.role !== 'seeker') {
            return res.status(403).json({ message: 'Only seekers can create service requests' });
        }

        const newRequest = new ServiceRequest({
            seeker: userId,
            category,
            description,
            contactNumber, // Use contactNumber from request body
            location,
            duration, // Ensure duration is provided
            additionalDetails,
        });
        console.log(req.user)
        

        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (error) {
        console.error('Error creating service request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch all active service requests (visible to providers based on skills)
exports.getActiveRequests = async (req, res) => {
    try {
        if (req.user.role !== 'provider') {
            return res.status(403).json({ message: 'Only providers can view service requests' });
        }
        const user = await User.findById(req.user.id).select('-password')
        const skills = user.skills;
        const location = user.location;
        console.log('User Location:', location); // Add this line to debug
        console.log(skills)
        const radius = 1000; // Radius in kilometers

        // Check if location is defined
        if (!location || !location.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({ message: 'Invalid location' });
        }

        // Fetch active requests within range and matching provider skills
        const activeRequests = await ServiceRequest.find({
            category: { $in: skills },
            location: {
                $geoWithin: {
                    $centerSphere: [
                        [location.coordinates[0], location.coordinates[1]], // Seeker's coordinates
                        radius / 6378.1 // Radius in radians
                    ]
                }
            },
            expirationTime: { $gte: new Date() }, // Current date
            status: 'pending'
        }).populate('seeker', 'userName email contactNumber');

        res.status(200).json(activeRequests);
    } catch (error) {
        console.error('Error fetching active requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Accept a service request
exports.acceptRequest = async (req, res) => {
    try {
        const requestId = req.params.id;

        // Ensure the user is a provider
        if (req.user.role !== 'provider') {
            return res.status(403).json({ message: 'Only providers can accept requests' });
        }
        console.log(requestId)
        // Find and update the request
        const request = await ServiceRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: 'Service request not found' });

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request is no longer active' });
        }

        request.status = 'in-progress';
        request.provider = req.user._id;
        request.generatedPin = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit PIN

        await request.save();
        res.status(200).json({ message: 'Request accepted', request });
    } catch (error) {
        console.error('Error accepting request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update request status to 'completed'
exports.completeRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const { pin } = req.body;

        // Find the service request
        const request = await ServiceRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: 'Service request not found' });

        // Validate PIN
        if (request.generatedPin !== pin) {
            return res.status(400).json({ message: 'Invalid PIN' });
        }

        request.status = 'completed';
        await request.save();

        res.status(200).json({ message: 'Request completed successfully', request });
    } catch (error) {
        console.error('Error completing request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch request history for a user (seeker or provider)
exports.getRequestHistory = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming req.user contains the authenticated user's details
        const userRole = req.user.role; // Assuming req.user.role indicates 'seeker' or 'provider'
        let history = [];

        if (userRole === 'seeker') {
            // Get all requests where the user is the seeker
            history = await Request.find({ seeker: userId })
                .populate('provider', 'name contactNumber') // Populate provider details
                .select('category description location status history createdAt') // Select relevant fields
                .exec();

            // Format the response for the seeker
            const formattedHistory = history.map(request => ({
                category: request.category,
                description: request.description,
                location: request.location.coordinates,
                status: request.status,
                provider: request.provider ? {
                    name: request.provider.name,
                    contactNumber: request.provider.contactNumber
                } : null,
                history: request.history.map(item => ({
                    status: item.status,
                    provider: item.provider,
                    timestamp: item.timestamp
                })),
                createdAt: request.createdAt
            }));

            return res.status(200).json({
                role: 'seeker',
                history: formattedHistory
            });

        } else if (userRole === 'provider') {
            // Get all requests where the user is the provider in the history
            
            history = await Request.find({ 'history.provider': userId })
                .populate('seeker', 'name contactNumber') // Populate seeker details
                .select('category description location status history createdAt') // Select relevant fields
                .exec();
            console.log(history)
            // Format the response for the provider
            const formattedHistory = history.map(request => ({
                category: request.category,
                description: request.description,
                location: request.location.coordinates,
                status: request.status,
                seeker: request.seeker ? {
                    name: request.seeker.name,
                    contactNumber: request.seeker.contactNumber
                } : null,
                history: request.history.filter(item => String(item.provider) === String(userId)).map(item => ({
                    status: item.status,
                    timestamp: item.timestamp
                })),
                createdAt: request.createdAt
            }));
            console.log(formattedHistory)
            return res.status(200).json({
                role: 'provider',
                history: formattedHistory
            });

        } else {
            return res.status(400).json({ message: "Invalid role specified." });
        }

    } catch (error) {
        return res.status(500).json({ message: "Error fetching history", error });
    }
};


