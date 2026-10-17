import { apiClient } from '../api/client';

const decodeKey = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

export const registerAdminPush = async () => {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    console.warn('[WebPush] Web Push is not supported in this browser environment.');
    return;
  }

  const permission =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;

  if (permission !== 'granted') {
    console.info('[WebPush] Notification permission not granted (status: ' + permission + ').');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/push-sw.js');
    await navigator.serviceWorker.ready;

    const keyResponse = await apiClient.get<{ publicKey?: string } | string>('/admin/push/public-key');
    const rawKey =
      typeof keyResponse.data === 'string'
        ? keyResponse.data
        : keyResponse.data?.publicKey;

    if (!rawKey) {
      console.warn('[WebPush] VAPID public key not received from server.');
      return;
    }

    const applicationServerKey = decodeKey(rawKey);

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();

    // If subscription key doesn't match or needs refresh, renew it
    if (subscription && subscription.options?.applicationServerKey) {
      const currentKeyBytes = new Uint8Array(subscription.options.applicationServerKey);
      const isMatch =
        currentKeyBytes.length === applicationServerKey.length &&
        currentKeyBytes.every((b, i) => b === applicationServerKey[i]);

      if (!isMatch) {
        console.info('[WebPush] VAPID key mismatch detected; re-subscribing...');
        await subscription.unsubscribe();
        subscription = null;
      }
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      console.info('[WebPush] New Web Push subscription created successfully.');
    }

    const json = subscription.toJSON();
    if (json.endpoint && json.keys?.p256dh && json.keys.auth) {
      await apiClient.post('/admin/push/subscriptions', {
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      });
      console.info('[WebPush] Push subscription synchronized with backend database.');
    }
  } catch (error) {
    console.error('[WebPush] Failed to register push subscription:', error);
  }
};
