import { gql, useQuery } from "@apollo/client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$projectId")({
  component: ProjectComponent,
});

type ProjectResponse = {
  project: {
    columns: {
      id: string;
      tasks: {
        id: string;
        title: string;
      }[];
    }[];
  };
};

function ProjectComponent() {
  const { projectId } = Route.useParams();
  const project = useQuery<ProjectResponse>(
    gql`
      query GetProject($projectId: ID!) {
        project(id: $projectId) {
          columns {
            id
            tasks {
              id
              title
            }
          }
        }
      }
    `,
    {
      variables: {
        projectId,
      },
    }
  );

  return (
    <div>
      <h1>Project: {projectId}</h1>
      <ul>
        {project.data?.project.columns.map((column) => (
          <li key={column.id}>
            <h2>{column.id}</h2>
            <ul>
              {column.tasks.map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
