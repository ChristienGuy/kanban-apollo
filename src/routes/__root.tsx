import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        }))
      );

export const Route = createRootRoute({
  meta: () => [
    {
      charSet: "utf-8",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      title: "Kanban Apollo",
    },
  ],
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <React.Suspense>
        <TanStackRouterDevtools />
      </React.Suspense>
    </>
  );
}
