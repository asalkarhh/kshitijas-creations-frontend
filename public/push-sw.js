self.addEventListener('push', (event) => {
  let data = {
    title: '🔔 New Order Received',
    body: 'A new order has arrived in your studio.',
    url: '/admin/orders',
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon-32x32.png',
      badge: '/favicon-16x16.png',
      data: { url: data.url || '/admin/orders' },
      vibrate: [200, 100, 200],
      tag: 'new-order',
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const target = event.notification.data?.url || '/admin/orders';
      const existing = clients.find((client) => 'focus' in client);
      if (existing) {
        existing.navigate(target);
        return existing.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
