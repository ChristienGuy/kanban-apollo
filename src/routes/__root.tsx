import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { useQuery } from "@apollo/client";
import { GET_PROJECTS } from "../queries";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
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

function Sidebar() {
  const { data } = useQuery(GET_PROJECTS);

  return (
    <div className="flex flex-col border-r border-gray-200 h-full p-4">
      <header className="h-10 flex flex-row items-center">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {data?.projects.map((project) => (
            <li key={project.id}>
              <Link
                to="/$projectId"
                params={{
                  projectId: project.id,
                }}
              >
                {project.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RootComponent() {
  return (
    <>
      <div className="grid grid-cols-12 min-h-dvh">
        <div className="col-span-2">
          <Sidebar />
        </div>
        <div className="col-span-10 p-4">
          <Outlet />
          <React.Suspense>
            <TanStackRouterDevtools />
          </React.Suspense>
        </div>
      </div>
    </>
  );
}
