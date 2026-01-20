
import { useState, useEffect } from 'react';
import { useRegisterPushSubscriptionMutation } from '../store/api';
import { urlBase64ToUint8Array } from '../utils/webPush';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const usePushNotifications = () => {
    const [subscription, setSubscription] = useState(null);
    const [isSupported, setIsSupported] = useState(false);
    const [registerPush] = useRegisterPushSubscriptionMutation();

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
            setSubscription(sub);
        }
    };

    const subscribeToNotifications = async () => {
        if (!VAPID_PUBLIC_KEY) {
            console.error('VAPID Public Key is missing in environment variables.');
            alert('Push notifications configuration is missing.');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            setSubscription(sub);

            // Send to backend
            const { endpoint, keys } = sub.toJSON();
            await registerPush({
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth
            }).unwrap();

            console.log('Push Notification Subscribed and Registered on Backend');
        } catch (error) {
            console.error('Failed to subscribe to push notifications', error);
            alert('Failed to enable notifications.');
        }
    };

    return {
        isSupported,
        subscription,
        subscribeToNotifications
    };
};
