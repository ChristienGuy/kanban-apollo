import { useQuery } from "@apollo/client";
import { createFileRoute } from "@tanstack/react-router";
import { GET_PROJECT } from "../queries";
import { GetProjectQuery } from "../__generated__/graphql";

export const Route = createFileRoute("/$projectId")({
  component: ProjectComponent,
});

function Column({
  column,
}: {
  column: GetProjectQuery["project"]["columns"][number];
}) {
  const sortedTasks = [...column.tasks];
  sortedTasks.sort((a, b) => {
    if (a.position < b.position) {
      return -1;
    }
    if (b.position < a.position) {
      return 1;
    }
    return 0;
  });

  return (
    <li key={column.id} className="bg-gray-200 p-4 rounded-lg">
      <ul className="flex flex-col gap-2">
        <li className="font-bold">{column.title}</li>
        {sortedTasks.map((task) => (
          <li
            className="border shadow-sm bg-white rounded-lg p-2"
            key={task.id}
          >
            {task.title}
          </li>
        ))}
      </ul>
    </li>
  );
}

function ProjectComponent() {
  const { projectId } = Route.useParams();
  const { data, error, loading } = useQuery(GET_PROJECT, {
    variables: {
      projectId,
    },
  });

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
              <Column key={column.id} column={column} />
            ))}
          </ul>
        </>
      ) : (
        <div>No data</div>
      )}
    </div>
  );
}
