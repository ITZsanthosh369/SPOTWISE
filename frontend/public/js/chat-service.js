class ChatService {
    constructor() {
        this.activeChat = null;
        this.unreadMessages = new Map(); // Track unread messages per chat
    }

    // Initialize chat functionality
    init() {
        this.setupChatPanel();
        this.setupSocketListeners();
    }

    // Setup chat panel UI
    setupChatPanel() {
        const chatPanel = `
            <div class="chat-panel" id="chatPanel">
                <div class="chat-header">
                    <h4>Chat</h4>
                    <button class="minimize-btn" onclick="toggleChatPanel()">−</button>
                </div>
                <div class="chat-messages" id="chatMessages"></div>
                <div class="chat-input">
                    <textarea id="messageInput" placeholder="Type a message..."></textarea>
                    <button onclick="sendMessage()">Send</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatPanel);

        // Add enter key listener for sending messages
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    // Setup WebSocket listeners for chat
    setupSocketListeners() {
        window.socketService.socket.on('newMessage', (data) => {
            this.handleNewMessage(data);
        });

        window.socketService.socket.on('messageRead', (data) => {
            this.updateMessageReadStatus(data);
        });
    }

    // Initialize chat for a service request
    async initializeChat(requestId, otherUser) {
        try {
            const response = await fetch(`/api/chat/init/${requestId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to initialize chat');

            const chat = await response.json();
            this.activeChat = chat._id;
            this.loadChatHistory();
            
            // Update chat header with other user's name
            document.querySelector('.chat-header h4').textContent = 
                `Chat with ${otherUser.userName}`;
            
            // Show chat panel
            document.getElementById('chatPanel').classList.add('active');
        } catch (error) {
            console.error('Chat initialization error:', error);
            showNotification('Error', 'Failed to start chat');
        }
    }

    // Load chat history
    async loadChatHistory() {
        try {
            const response = await fetch(`/api/chat/${this.activeChat}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load chat history');

            const chat = await response.json();
            this.displayChatHistory(chat.messages);
            this.markMessagesAsRead();
        } catch (error) {
            console.error('Load chat history error:', error);
        }
    }

    // Display chat history
    displayChatHistory(messages) {
        const chatMessages = document.getElementById('chatMessages');
        const currentUserId = localStorage.getItem('userId');
        
        chatMessages.innerHTML = messages.map(message => `
            <div class="message ${message.sender._id === currentUserId ? 'sent' : 'received'}">
                <div class="message-content">
                    ${message.content}
                    <span class="message-time">
                        ${new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    ${message.read ? '<span class="read-status">✓✓</span>' : '<span class="read-status">✓</span>'}
                </div>
            </div>
        `).join('');

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send a message
    async sendMessage() {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();

        if (!content || !this.activeChat) return;

        try {
            // Emit message through socket
            window.socketService.socket.emit('sendMessage', {
                chatId: this.activeChat,
                content: content
            });

            // Clear input
            input.value = '';
        } catch (error) {
            console.error('Send message error:', error);
            showNotification('Error', 'Failed to send message');
        }
    }

    // Handle incoming message
    handleNewMessage(data) {
        if (data.chatId === this.activeChat) {
            this.appendMessage(data);
            this.markMessagesAsRead();
        } else {
            // Update unread count for inactive chat
            const count = this.unreadMessages.get(data.chatId) || 0;
            this.unreadMessages.set(data.chatId, count + 1);
            this.updateUnreadBadge(data.chatId);
        }
    }

    // Append new message to chat
    appendMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        const currentUserId = localStorage.getItem('userId');
        
        const messageElement = `
            <div class="message ${message.sender._id === currentUserId ? 'sent' : 'received'}">
                <div class="message-content">
                    ${message.content}
                    <span class="message-time">
                        ${new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    <span class="read-status">✓</span>
                </div>
            </div>
        `;

        chatMessages.insertAdjacentHTML('beforeend', messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Mark messages as read
    async markMessagesAsRead() {
        if (!this.activeChat) return;

        try {
            await fetch(`/api/chat/${this.activeChat}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Emit read status through socket
            window.socketService.socket.emit('markRead', {
                chatId: this.activeChat
            });
        } catch (error) {
            console.error('Mark messages as read error:', error);
        }
    }

    // Update message read status
    updateMessageReadStatus(data) {
        if (data.chatId === this.activeChat) {
            const messages = document.querySelectorAll('.message.sent .read-status');
            messages.forEach(status => {
                status.textContent = '✓✓';
            });
        }
    }

    // Update unread message badge
    updateUnreadBadge(chatId) {
        const badge = document.querySelector(`[data-chat-id="${chatId}"] .unread-badge`);
        if (badge) {
            const count = this.unreadMessages.get(chatId) || 0;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }
}

// Initialize the service
window.chatService = new ChatService();

// Helper functions
function toggleChatPanel() {
    document.getElementById('chatPanel').classList.toggle('minimized');
}

function sendMessage() {
    window.chatService.sendMessage();
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatService.init();
}); 