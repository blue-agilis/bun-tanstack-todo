import { MutationCache, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient({
	mutationCache: new MutationCache({
		onSuccess: () => {
			queryClient.invalidateQueries();
		},
	}),
	defaultOptions: {
		queries: {
			staleTime: 10_000,
		},
	},
});

export const getRouter = () => {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
};
