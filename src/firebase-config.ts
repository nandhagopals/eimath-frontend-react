import firebase from "firebase/compat/app";
import "firebase/compat/messaging";
import { getDatabase } from "firebase/database";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = firebase.initializeApp(firebaseConfig);

const database = getDatabase(app);

const messaging = getMessaging(app);

const publicKey = `${import.meta.env.VITE_NOTIFICATION_PUBLIC_KEY}`;

const getTokenFirebaseMessage = async () => {
	const serviceWorker = await navigator.serviceWorker
		.register(`/firebase-messaging-sw.js?firebaseConfig=${firebaseConfig}`)
		.then((res) => res);

	return await getToken(messaging, {
		vapidKey: publicKey,
		serviceWorkerRegistration: serviceWorker,
	});
};

export { messaging, database, publicKey, getTokenFirebaseMessage };
