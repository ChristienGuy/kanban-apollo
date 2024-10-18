import { gql, useQuery } from "@apollo/client";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

type Project = {
  id: string;
  title: string;
};
type ProjectResponse = {
  projects: Project[];
};

function IndexPage() {
  const projectsQuery = useQuery<ProjectResponse>(gql`
    query GetProjects {
      projects {
        __typename
        id
        title
      }
    }
  `);

  return (
    <>
      <header className="h-10 flex flex-row items-center border-b border-gray-200 shadow-md">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <ul>
        {projectsQuery.data?.projects.map((project) => (
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
    </>
  );
}
