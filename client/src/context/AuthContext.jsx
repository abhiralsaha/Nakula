import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and subscribe to auth changes
        const syncUser = async (session) => {
            if (session?.user) {
                try {
                    // Sync with backend to ensure MongoDB user exists
                    // Sync with backend to ensure MongoDB user exists
                    await api.post('/auth/sync', {
                        email: session.user.email,
                        phone: session.user.phone,
                        phone_confirmed_at: session.user.phone_confirmed_at
                    });
                } catch (err) {
                    console.error('Sync error:', err);
                }
                setUser(session.user);
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            syncUser(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            syncUser(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
