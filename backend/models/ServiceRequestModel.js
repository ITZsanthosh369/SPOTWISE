const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    contactNumber: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    duration: { type: Number, required: true }, // Duration in minutes for request validity
    additionalDetails: { type: String },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled','expired'], default: 'pending' },
    generatedPin: { type: String },
    pinGeneratedAt: { type: Date },
    history: [{
        provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['accepted', 'completed'] },
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    expirationTime: { type: Date } // Add expirationTime field
}, { timestamps: true });

// Middleware to set expirationTime based on duration
requestSchema.pre('save', function(next) {
    this.expirationTime = new Date(Date.now() + this.duration * 60 * 1000); // Convert minutes to milliseconds
    next();
});
// Middleware to update the status to 'expired' if the current time is greater than expirationTime
requestSchema.pre('find', function(next) {
    const currentTime = new Date();
    this.updateMany(
        { expirationTime: { $lt: currentTime }, status: { $ne: 'expired' } }, // Only update if not already 'expired'
        { status: 'expired' },
        next
    );
});

requestSchema.pre('save', function(next) {
    // Check if the status field has been modified
    if (this.isModified('status')) {
        // Custom logic for when the status changes to 'in-progress'
        if (this.status === 'in-progress') {
            this.history.push({
                provider: this.provider || null,  // Record provider if available
                status: 'accepted',               // Add 'accepted' to history for 'in-progress' status
                timestamp: new Date()             // Add the current timestamp
            });
        }

        // Custom logic for when the status changes to 'completed'
        if (this.status === 'completed') {
            this.history.push({
                provider: this.provider || null,  // Record provider if available
                status: 'completed',              // Add 'completed' to history
                timestamp: new Date()             // Add the current timestamp
            });
        }
    }

    next();
});


requestSchema.pre('findOne', function(next) {
    const currentTime = new Date();
    this.updateOne(
        { expirationTime: { $lt: currentTime }, status: { $ne: 'expired' } }, // Only update if not already 'expired'
        { status: 'expired' },
        next
    );
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
