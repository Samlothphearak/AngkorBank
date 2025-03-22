const mongoose = require('mongoose');

// Define notification schema with additional fields
const notificationSchema = new mongoose.Schema({
    message: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    type: { 
        type: String, 
        enum: ['bank', 'news', 'payment', 'alert'],  // Enum for notification types
        required: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',  // Reference to the User who will receive this notification
        required: true 
    },
    link: { 
        type: String, 
        default: ''  // Optional URL link for the notification, can be used to redirect to a page
    },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'],  // Priority of the notification
        default: 'medium' 
    },
    status: { 
        type: String, 
        enum: ['active', 'archived'],  // Track if the notification is active or archived
        default: 'active' 
    }
});

// Create and export the Notification model
module.exports = mongoose.model('Notification', notificationSchema);