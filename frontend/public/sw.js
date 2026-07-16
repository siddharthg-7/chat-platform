self.addEventListener('push', function(event) {
  let payload = { title: 'New Message', body: 'You have a new message' };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'New Notification', body: event.data.text() };
    }
  }

  const options = {
    body: payload.body,
    icon: '/favicon.svg', // using existing favicon
    badge: '/favicon.svg',
    data: {
      url: payload.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then( windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        // If so, just focus it.
        if (client.url.includes(event.notification.data.url) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
