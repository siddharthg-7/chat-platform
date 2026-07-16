import api from './api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeToPushNotifications = async (vapidPublicKey) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('ServiceWorker registered with scope:', registration.scope);

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Send subscription to backend
    await api.post('/notifications/push-subscribe/', subscription.toJSON());
    console.log('Push subscription successful!');
  } catch (error) {
    console.error('Error during push subscription:', error);
  }
};
