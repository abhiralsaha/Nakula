import { toast } from 'react-hot-toast';

// Toast notification wrapper with theme support
export const notify = {
    success: (message) => {
        toast.success(message, {
            style: {
                background: '#10b981',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
            },
        });
    },

    error: (message) => {
        toast.error(message, {
            style: {
                background: '#ef4444',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
            },
        });
    },

    info: (message) => {
        toast(message, {
            icon: 'ℹ️',
            style: {
                background: '#3b82f6',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
            },
        });
    },

    promise: (promise, messages) => {
        return toast.promise(
            promise,
            {
                loading: messages.loading || 'Loading...',
                success: messages.success || 'Success!',
                error: messages.error || 'Error occurred',
            },
            {
                style: {
                    borderRadius: '12px',
                    padding: '16px',
                },
            }
        );
    },
};
