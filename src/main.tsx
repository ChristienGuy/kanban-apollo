import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen.ts";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const link = createHttpLink({
  uri: "http://localhost:4000",
  credentials: "include",
});
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ApolloProvider client={client}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </ClerkProvider>
  </StrictMode>
);
