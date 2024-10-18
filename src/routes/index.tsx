import { useQuery } from "@apollo/client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GET_PROJECTS } from "../queries";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const projectsQuery = useQuery(GET_PROJECTS);

  return (
    <>
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
