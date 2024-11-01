import { createRouter, RouterProvider } from "@tanstack/react-router";

import "App.css";

import { rootRoute, privateLayoutRoute, publicLayoutRoute } from "routes";

import { AuthProvider } from "components/AuthProvider";
import { ToastedNotificationProvider } from "components/ToastNotification";

import { useAuth } from "global/hook";
import { toastNotification } from "global/cache";

import { onMessage } from "firebase/messaging";

import { messaging } from "firebase-config";

onMessage(messaging, (payload) => {
	toastNotification([
		{
			message: payload.data?.body || "N/A",
			messageType: "success",
		},
	]);
});

const router = createRouter({
  routeTree: rootRoute.addChildren([publicLayoutRoute, privateLayoutRoute]),
  context: {
    auth: {
      isAuthenticated: false,
      authUserDetails: null,
      setAuthUserDetails: null!,
    },
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const InnerApp = () => {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ auth: auth }} />;
};

const App = () => {
  return (
    <AuthProvider>
      <ToastedNotificationProvider>
        <InnerApp />
      </ToastedNotificationProvider>
    </AuthProvider>
  );
};

export default App;
