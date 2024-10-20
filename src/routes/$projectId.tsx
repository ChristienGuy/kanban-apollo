import { useMutation, useQuery } from "@apollo/client";
import { createFileRoute } from "@tanstack/react-router";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";

import { GET_PROJECT } from "../queries";
import { GetProjectQuery } from "../__generated__/graphql";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { generateKeyBetween } from "@/lib/order";
import { gql } from "@/__generated__";

enum DROPPABLE_TYPE {
  COLUMN = "COLUMN",
  TASK = "TASK",
}

export const Route = createFileRoute("/$projectId")({
  component: ProjectComponent,
});

const getSortedTasks = (
  tasks: GetProjectQuery["project"]["columns"][number]["tasks"],
) => {
  const sortedTasks = [...tasks];
  sortedTasks.sort((a, b) => {
    if (a.position < b.position) {
      return -1;
    }
    if (b.position < a.position) {
      return 1;
    }
    return 0;
  });
  return sortedTasks;
};

const getSortedColumns = (columns: GetProjectQuery["project"]["columns"]) => {
  const sortedColumns = [...columns];
  sortedColumns.sort((a, b) => {
    if (a.position < b.position) {
      return -1;
    }
    if (b.position < a.position) {
      return 1;
    }
    return 0;
  });
  return sortedColumns.map((column) => {
    return {
      ...column,
      tasks: getSortedTasks(column.tasks),
    };
  });
};

function Column({
  column,
  index,
}: {
  column: GetProjectQuery["project"]["columns"][number];
  index: number;
}) {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(colDraggableProvided) => {
        return (
          <li
            {...colDraggableProvided.draggableProps}
            {...colDraggableProvided.dragHandleProps}
            ref={colDraggableProvided.innerRef}
            className="bg-gray-200 p-4 rounded-lg"
          >
            <h2>
              {column.title} - {column.position}
            </h2>
            <Droppable droppableId={column.id} type={DROPPABLE_TYPE.TASK}>
              {(colDroppableProvided) => {
                return (
                  <ul
                    className="flex flex-col"
                    {...colDroppableProvided.droppableProps}
                    ref={colDroppableProvided.innerRef}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(taskDraggableProvided, snapshot) => {
                          return (
                            <li
                              {...taskDraggableProvided.draggableProps}
                              {...taskDraggableProvided.dragHandleProps}
                              key={task.id}
                              ref={taskDraggableProvided.innerRef}
                              className="mb-2"
                            >
                              <Card
                                className={cn("transition", {
                                  "shadow-lg scale-105": snapshot.isDragging,
                                  "!rotate-0 shadow-sm scale-100":
                                    snapshot.isDropAnimating,
                                })}
                              >
                                <CardHeader>{task.title}</CardHeader>
                                {task.position}
                              </Card>
                            </li>
                          );
                        }}
                      </Draggable>
                    ))}
                    {colDroppableProvided.placeholder}
                  </ul>
                );
              }}
            </Droppable>
          </li>
        );
      }}
    </Draggable>
  );
}

function ProjectComponent() {
  const { projectId } = Route.useParams();
  const projectQuery = useQuery(GET_PROJECT, {
    variables: {
      projectId,
    },
  });

  const [updateTask] = useMutation(
    gql(`
    mutation UpdateTask($updateTaskId: String!, $position: String, $title: String, $columnId: String) {
      updateTask(id: $updateTaskId, position: $position, title: $title, columnId: $columnId) {
        __typename
        id
        position
      }
    }`),
  );

  if (projectQuery.loading) {
    return <div>loading...</div>;
  }

  if (projectQuery.error) {
    return <div>Error: {projectQuery.error.message}</div>;
  }

  const sortedColumns = getSortedColumns(projectQuery.data.project.columns);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      // If there's no destination, the item was dropped outside of a droppable or the drag was cancelled
      // So we return early to avoid updating any state
      return;
    }

    if (result.type === DROPPABLE_TYPE.COLUMN) {
      console.log("moved column");
      // Get the future column order
      // get the new lexical position string
      // update the column with the new position
      // return the optimistic result
    }

    if (result.type === DROPPABLE_TYPE.TASK) {
      const droppedIndex = result.destination.index;
      const droppedColumnId = result.destination.droppableId;
      const column = sortedColumns.find(
        (column) => column.id === droppedColumnId,
      );

      if (!column) {
        throw new Error(
          "managed to drop into a column that doesn't exist, what?",
        );
      }

      const filteredTasks = column.tasks.filter(
        (task) => task.id !== result.draggableId,
      );

      const tasksAfterDrop = [
        ...filteredTasks.slice(0, droppedIndex),
        {
          id: result.draggableId,
          position: undefined,
        },
        ...filteredTasks.slice(droppedIndex),
      ];

      // Find the dragged task's new neighbours in the list
      const prevTaskPosition = tasksAfterDrop[droppedIndex - 1]
        ? tasksAfterDrop[droppedIndex - 1].position
        : undefined;
      const nextTaskPosition = tasksAfterDrop[droppedIndex + 1]
        ? tasksAfterDrop[droppedIndex + 1].position
        : undefined;

      // calculate a position between them
      const newPosition = generateKeyBetween(
        prevTaskPosition,
        nextTaskPosition,
      );

      if (newPosition === null) {
        throw new Error("Failed to generate new position");
      }

      updateTask({
        variables: {
          updateTaskId: result.draggableId,
          position: newPosition,
          columnId: droppedColumnId,
        },
        optimisticResponse: {
          __typename: "Mutation",
          updateTask: {
            __typename: "Task",
            id: result.draggableId,
            position: newPosition,
          },
        },
        update: (cache, { data }) => {
          // find column that the task was moved from
          const sourceColumn = sortedColumns.find((column) =>
            column.tasks.find((task) => task.id === result.draggableId),
          );

          // Find the column the task was moved to
          const targetColumn = sortedColumns.find(
            (column) => column.id === droppedColumnId,
          );
          if (!sourceColumn || !targetColumn) {
            throw new Error("Failed to find source or target column");
          }
          if (!data?.updateTask) {
            throw new Error("No update response");
          }

          if (sourceColumn.id === targetColumn.id) {
            // If source and target columns are the same, we don't need to update the cache manually
            return;
          }

          // find the task that was moved
          const foundTask = sourceColumn.tasks.find(
            (task) => task.id === result.draggableId,
          );

          if (!foundTask) {
            throw new Error("Failed to find task in source column");
          }

          const task = {
            ...foundTask,
            position: data.updateTask.position,
          };

          // Remove the task from the source column
          const sourceTasks = sourceColumn.tasks.filter(
            (task) => task.id !== result.draggableId,
          );
          // insert new task into the target column
          const targetTasks = [
            ...targetColumn.tasks.slice(0, droppedIndex),
            task,
            ...targetColumn.tasks.slice(droppedIndex),
          ];

          // remove the source and target columns from the list of columns
          const filteredColumns = sortedColumns.filter(
            (column) =>
              column.id !== sourceColumn.id && column.id !== targetColumn.id,
          );

          const newColumns = [
            ...filteredColumns,
            { ...sourceColumn, tasks: sourceTasks },
            { ...targetColumn, tasks: targetTasks },
          ];

          return cache.modify({
            id: cache.identify(projectQuery.data.project),
            fields: {
              columns: () => {
                // TODO: deal with potentially lost cache data when updating tasks
                // consider writing new task fragments to the cache for each column
                const newColumnsRefs = newColumns.map((column) => {
                  return cache.writeFragment({
                    data: column,
                    fragment: gql(`
                      fragment NewColumn on Column {
                        id
                        title
                        position
                        tasks {
                          id
                          title
                          position
                        }
                      }
                    `),
                  });
                });

                return newColumnsRefs;
              },
            },
          });
        },
      });
    }
  };

  return (
    <div>
      {projectQuery.data ? (
        <>
          <h1>Project: {projectQuery.data.project.title}</h1>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
              droppableId="board"
              direction="horizontal"
              type={DROPPABLE_TYPE.COLUMN}
            >
              {(provided) => {
                return (
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-3 gap-4"
                  >
                    {sortedColumns.map((column, index) => (
                      <Column key={column.id} column={column} index={index} />
                    ))}
                    {provided.placeholder}
                  </ul>
                );
              }}
            </Droppable>
          </DragDropContext>
        </>
      ) : (
        <div>No data</div>
      )}
    </div>
  );
}
