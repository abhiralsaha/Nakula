const notificationService = {
    sendSMS: async (to, message) => {
        // Mock SMS Service
        console.log(`[SMS SERVICE] Sending to ${to}: ${message}`);
        return true;
    },

    sendEmail: async (to, subject, body) => {
        // Mock Email Service
        console.log(`[EMAIL SERVICE] Sending to ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        return true;
    },

    sendAlarm: async (user, task) => {
        // Mock Alarm/Push Notification
        console.log(`[ALARM SERVICE] Triggering alarm for user ${user.username} for task ${task.title}`);
        return true;
    }
};

module.exports = notificationService;
