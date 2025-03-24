/**
 * SpotWise Location Service
 * Provides reusable location-related functionality for the SpotWise application
 */
class LocationService {
    constructor() {
        this.geocoder = null;
        this.defaultLocation = { lat: 12.9716, lng: 77.5946 }; // Bangalore, India
    }

    /**
     * Initialize the location service
     */
    init() {
        this.geocoder = new google.maps.Geocoder();
    }

    /**
     * Get the user's current location
     * @returns {Promise} A promise that resolves with the user's coordinates
     */
    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(location);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    reject(error);
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        });
    }

    /**
     * Initialize Google Places Autocomplete on an input field
     * @param {HTMLElement} inputElement - The input element to attach autocomplete to
     * @param {Object} options - Autocomplete options
     * @param {Function} callback - Callback function when a place is selected
     * @returns {google.maps.places.Autocomplete} The autocomplete instance
     */
    initAutocomplete(inputElement, options = {}, callback = null) {
        const defaultOptions = {
            types: ['address'],
            componentRestrictions: { country: [] } // No country restriction by default
        };

        const autocomplete = new google.maps.places.Autocomplete(
            inputElement,
            { ...defaultOptions, ...options }
        );

        if (callback) {
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry && place.geometry.location) {
                    callback(place);
                }
            });
        }

        return autocomplete;
    }

    /**
     * Convert coordinates to address (reverse geocoding)
     * @param {Object} latLng - The coordinates { lat, lng }
     * @returns {Promise} A promise that resolves with the address
     */
    getAddressFromCoordinates(latLng) {
        return new Promise((resolve, reject) => {
            if (!this.geocoder) {
                this.geocoder = new google.maps.Geocoder();
            }

            this.geocoder.geocode({ location: latLng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve(results[0]);
                } else {
                    reject(new Error(`Geocoder failed due to: ${status}`));
                }
            });
        });
    }

    /**
     * Convert address to coordinates (forward geocoding)
     * @param {string} address - The address to geocode
     * @returns {Promise} A promise that resolves with the coordinates
     */
    getCoordinatesFromAddress(address) {
        return new Promise((resolve, reject) => {
            if (!this.geocoder) {
                this.geocoder = new google.maps.Geocoder();
            }

            this.geocoder.geocode({ address: address }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve(results[0].geometry.location);
                } else {
                    reject(new Error(`Geocoder failed due to: ${status}`));
                }
            });
        });
    }

    /**
     * Calculate distance between two points
     * @param {Object} origin - The origin coordinates { lat, lng }
     * @param {Object} destination - The destination coordinates { lat, lng }
     * @returns {number} Distance in kilometers
     */
    calculateDistanceInKm(origin, destination) {
        const R = 6371; // Earth's radius in km
        const dLat = this.deg2rad(destination.lat - origin.lat);
        const dLng = this.deg2rad(destination.lng - origin.lng);
        
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(origin.lat)) * Math.cos(this.deg2rad(destination.lat)) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in km
        
        return distance;
    }
    
    /**
     * Convert degrees to radians
     * @param {number} deg - Degrees
     * @returns {number} Radians
     */
    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    /**
     * Extract address components from Google geocode result
     * @param {Object} result - Geocode result
     * @returns {Object} Structured address object
     */
    extractAddressComponents(result) {
        const addressInfo = {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
        };

        if (!result || !result.address_components) return addressInfo;

        // Process address components
        for (const component of result.address_components) {
            const type = component.types[0];
            
            switch (type) {
                case 'street_number':
                    addressInfo.street = component.long_name;
                    break;
                case 'route':
                    addressInfo.street += addressInfo.street 
                        ? ' ' + component.long_name 
                        : component.long_name;
                    break;
                case 'locality':
                    addressInfo.city = component.long_name;
                    break;
                case 'administrative_area_level_1':
                    addressInfo.state = component.long_name;
                    break;
                case 'postal_code':
                    addressInfo.postalCode = component.long_name;
                    break;
                case 'country':
                    addressInfo.country = component.long_name;
                    break;
            }
        }

        // If street is empty but we have a formatted address, use that
        if (!addressInfo.street && result.formatted_address) {
            addressInfo.street = result.formatted_address;
        }

        return addressInfo;
    }
}

// Export the service
window.locationService = new LocationService();
