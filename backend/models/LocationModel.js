const mongoose = require('mongoose');

const providerLocationSchema = new mongoose.Schema({
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' }, // GeoJSON format
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

providerLocationSchema.index({ location: '2dsphere' }); // Create a 2dsphere index for geospatial queries

const ProviderLocation = mongoose.model('ProviderLocation', providerLocationSchema);

module.exports = ProviderLocation;
