/**
 * SpotWise Event Service
 * Handles real-time Server-Sent Events (SSE) for the SpotWise application
 */

class EventService {
    constructor() {
        this.eventSource = null;
        this.reconnectTimeout = 5000; // 5 seconds
        this.eventListeners = new Map();
        this.isConnected = false;
        this.token = null;
        this.userId = null;
        this.userRole = null;
    }

    /**
     * Initialize the event service
     */
    init() {
        this.token = localStorage.getItem('token');
        this.userId = localStorage.getItem('userId');
        this.userRole = localStorage.getItem('userRole');
        
        if (!this.token) {
            console.warn('No authentication token found, skipping event service initialization');
            return;
        }
        
        this.connect();
    }

    /**
     * Connect to the SSE endpoint
     */
    connect() {
        // Close existing connection if any
        this.disconnect();

        try {
            // Create new EventSource connection
            this.eventSource = new EventSource(`http://localhost:3000/api/events?token=${this.token}`);

            this.eventSource.onopen = () => {
                console.log('EventSource connection established');
                this.isConnected = true;
            };

            // Handle general connection error
            this.eventSource.onerror = (error) => {
                console.error('EventSource error:', error);
                this.isConnected = false;
                this.eventSource.close();
                
                // Try to reconnect after a delay
                setTimeout(() => this.connect(), this.reconnectTimeout);
            };

            // Set up default event listeners
            this.setupDefaultEventListeners();
            
        } catch (error) {
            console.error('Failed to initialize event source:', error);
            this.isConnected = false;
            
            // Try to reconnect after a delay
            setTimeout(() => this.connect(), this.reconnectTimeout);
        }
    }

    /**
     * Disconnect from the SSE endpoint
     */
    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
            this.isConnected = false;
        }
    }

    /**
     * Setup default event listeners
     */
    setupDefaultEventListeners() {
        // Listen for connection established event
        this.eventSource.addEventListener('connected', (event) => {
            const data = JSON.parse(event.data);
            console.log('Connected event received:', data);
        });

        // Listen for request updates
        this.eventSource.addEventListener('requestUpdated', (event) => {
            const data = JSON.parse(event.data);
            console.log('Request updated:', data);
            
            // Trigger any registered callbacks
            if (this.eventListeners.has('requestUpdated')) {
                const callbacks = this.eventListeners.get('requestUpdated');
                callbacks.forEach(callback => callback(data));
            }
        });
    }

    /**
     * Register an event listener
     * @param {string} event - The event name
     * @param {function} callback - The callback function
     * @returns {function} - Function to remove the listener
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        
        this.eventListeners.get(event).add(callback);
        
        // Return a function to remove the listener
        return () => {
            const listeners = this.eventListeners.get(event);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    }

    /**
     * Force reconnection to the SSE endpoint
     */
    reconnect() {
        this.disconnect();
        this.connect();
    }

    // Add helper method to get user information
    getUserInfo() {
        return {
            userId: this.userId,
            userRole: this.userRole
        };
    }
}

// Initialize the event service
window.eventService = new EventService();

// Connect when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize after a small delay to ensure all other scripts are loaded
    setTimeout(() => {
        window.eventService.init();
    }, 1000);
});
