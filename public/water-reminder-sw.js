self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "yes") {
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: "WATER_REMINDER_ACCEPTED", amount: 200 }));
        return clients[0]?.focus();
      })
    );
  }
});
