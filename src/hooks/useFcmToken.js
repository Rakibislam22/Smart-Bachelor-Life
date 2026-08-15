import { useEffect, useState } from 'react';
import { getToken, isSupported, onMessage } from 'firebase/messaging';
import { toast } from 'react-toastify';
import { messaging } from '../firebase/firebase.init';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const VITE_FIREBASE_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const useFcmToken = (user) => {
    const [fcmToken, setFcmToken] = useState('');
    const [permissionStatus, setPermissionStatus] = useState('default');
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        let unsubscribe = () => { };

        if (!user || typeof window === 'undefined') {
            setFcmToken('');
            setPermissionStatus('default');
            setError(null);
            return unsubscribe;
        }

        const registerForPushNotifications = async () => {
            try {
                if (!('Notification' in window) || !('serviceWorker' in navigator)) {
                    throw new Error('This browser does not support notifications or service workers.');
                }

                const supported = await isSupported();
                if (!supported || !messaging) {
                    throw new Error('Firebase Messaging is not supported in this browser.');
                }

                const permission = await Notification.requestPermission();
                if (!isMounted) {
                    return;
                }

                setPermissionStatus(permission);

                if (permission !== 'granted') {
                    setError(new Error('Notification permission was denied.'));
                    return;
                }

                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration,
                });

                if (!token) {
                    throw new Error('No FCM token was returned by Firebase.');
                }

                if (!isMounted) {
                    return;
                }

                setFcmToken(token);
                setError(null);

                const authToken = await user.getIdToken?.();
                const response = await fetch(`${API_BASE_URL}/api/notifications/register-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                    },
                    body: JSON.stringify({ token }),
                });

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data?.message || 'Failed to register FCM token.');
                }

                unsubscribe = onMessage(messaging, (payload) => {
                    const title = payload?.notification?.title || 'Smart Bachelor Life';
                    const message = payload?.notification?.body || 'You have a new notification.';
                    toast.info(message, {
                        toastId: `${title}-${message}`,
                    });
                });
            } catch (err) {
                if (isMounted) {
                    setError(err);
                }
            }
        };

        registerForPushNotifications();

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [user]);

    return { fcmToken, permissionStatus, error };
};

export default useFcmToken;
