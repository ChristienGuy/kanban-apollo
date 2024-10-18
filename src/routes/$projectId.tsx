import { gql, useQuery } from "@apollo/client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$projectId")({
  component: ProjectComponent,
});

type ProjectResponse = {
  project: {
    title: string;
    columns: {
      title: string;
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
  const { data, error, loading } = useQuery<ProjectResponse>(
    gql`
      query GetProject($projectId: ID!) {
        project(id: $projectId) {
          title
          columns {
            title
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

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {data ? (
        <>
          <h1>Project: {data.project.title}</h1>
          <ul className="grid grid-cols-3 gap-4">
            {data.project.columns.map((column) => (
              <li key={column.id} className="bg-gray-200 p-4 rounded-lg">
                <ul className="flex flex-col gap-2">
                  <li className="font-bold">{column.title}</li>
                  {column.tasks.map((task) => (
                    <li
                      className="border shadow-md bg-white rounded-lg p-2"
                      key={task.id}
                    >
                      {task.title}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div>No data</div>
      )}
    </div>
  );
}
