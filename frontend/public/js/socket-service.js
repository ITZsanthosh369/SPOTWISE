class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect() {
        this.socket = io('http://localhost:5000'); // Replace with your backend URL

        this.socket.on('connect', () => {
            this.connected = true;
            console.log('Connected to WebSocket server');
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('Disconnected from WebSocket server');
        });

        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for provider location updates
        this.socket.on('providerLocationUpdated', (data) => {
            // Update provider location on map
            updateProviderMarker(data.providerId, data.location);
        });

        // Listen for request updates
        this.socket.on('requestUpdated', (request) => {
            // Update UI with new request status
            updateRequestStatus(request);
        });

        // Listen for notifications
        this.socket.on('newRequestNotification', (data) => {
            showNotification('New Request', data.message);
        });

        // Chat events
        this.socket.on('newMessage', (data) => {
            window.chatService.handleNewMessage(data);
        });

        this.socket.on('messageRead', (data) => {
            window.chatService.updateMessageReadStatus(data);
        });
    }

    // Send location update (for providers)
    updateLocation(location) {
        if (this.connected) {
            this.socket.emit('updateLocation', {
                providerId: getCurrentUserId(), // Implement this function
                location: location
            });
        }
    }

    // Update request status
    updateRequestStatus(requestId, status) {
        if (this.connected) {
            this.socket.emit('requestStatusUpdate', {
                requestId,
                status,
                providerId: getCurrentUserId() // Implement this function
            });
        }
    }
}

// Helper functions
function updateProviderMarker(providerId, location) {
    // Update provider marker on the map
    // Implement this based on your map implementation
}

function updateRequestStatus(request) {
    // Update UI elements showing request status
    const statusElement = document.getElementById(`request-${request._id}-status`);
    if (statusElement) {
        statusElement.textContent = request.status;
        statusElement.className = `status-${request.status}`;
    }
}

function showNotification(title, message) {
    // Show notification to user
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body: message });
            }
        });
    }
}

// Export the service
window.socketService = new SocketService(); 