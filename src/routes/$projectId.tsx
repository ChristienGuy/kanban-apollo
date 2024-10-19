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
  return sortedColumns;
};

const getSortedBoard = (columns: GetProjectQuery["project"]["columns"]) => {
  const sortedColumns = getSortedColumns(columns);
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
  const { data, error, loading } = useQuery(GET_PROJECT, {
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
        column {
          __typename
          id
          project {
            __typename
            id
          }
        }
      }
    }`),
  );

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const sortedBoard = getSortedBoard(data.project.columns);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      // If there's no destination, the item was dropped outside of a droppable or the drag was cancelled
      // So we return early to avoid updating any state
      return;
    }

    if (result.type === DROPPABLE_TYPE.TASK) {
      const droppedIndex = result.destination.index;
      const droppedColumnId = result.destination.droppableId;
      const column = sortedBoard.find(
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
            column: {
              __typename: "Column",
              id: droppedColumnId,
              project: {
                __typename: "Project",
                id: column.project.id,
              },
            },
          },
        },
      });
    }
  };

  return (
    <div>
      {data ? (
        <>
          <h1>Project: {data.project.title}</h1>
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
                    {sortedBoard.map((column, index) => (
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
