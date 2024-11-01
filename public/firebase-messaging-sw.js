importScripts("https://www.gstatic.com/firebasejs/8.0.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.0.2/firebase-messaging.js");

self.addEventListener("fetch", () => {
	const urlParams = new URLSearchParams(location.search);
	self.firebaseConfig = Object.fromEntries(urlParams);
});

const defaultConfig = {
	apiKey: true,
	projectId: true,
	messagingSenderId: true,
	appId: true,
};

firebase.initializeApp(self.firebaseConfig || defaultConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
	const notificationTitle = payload?.data?.title || "N/A";
	const notificationOptions = {
		body: payload?.data?.body,
		icon: "/logo-50.svg",
		data: {
			url: payload?.data?.link,
		},
	};
	self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
	const url = event?.notification?.data?.url;
	event.notification.close();
	clients.openWindow(url);
	event.waitUntil(
		clients.matchAll({ type: "window" }).then((windowClients) => {
			for (let i = 0; i < windowClients.length; i++) {
				const client = windowClients[i];
				if (client.url === url && "focus" in client) {
					return client.focus();
				}
			}
			if (clients.openWindow) {
				return;
			}
		}),
	);
});
