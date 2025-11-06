import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a QueryClient instance
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 10_000,
		},
	},
});

// Create a new router instance
export const getRouter = () => {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
	});

	// Set up SSR query integration
	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
};
