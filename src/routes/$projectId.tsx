import { useQuery } from "@apollo/client";
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

export const Route = createFileRoute("/$projectId")({
  component: ProjectComponent,
});

function Column({
  column,
  index,
}: {
  column: GetProjectQuery["project"]["columns"][number];
  index: number;
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
    <Draggable draggableId={column.id} index={index}>
      {(colDraggableProvided) => {
        return (
          <li
            {...colDraggableProvided.draggableProps}
            {...colDraggableProvided.dragHandleProps}
            ref={colDraggableProvided.innerRef}
            className="bg-gray-200 p-4 rounded-lg"
          >
            <Droppable droppableId={column.id} type="TASK">
              {(colDroppableProvided) => {
                return (
                  <ul
                    className="flex flex-col"
                    {...colDroppableProvided.droppableProps}
                    ref={colDroppableProvided.innerRef}
                  >
                    <li className="font-bold">{column.title}</li>
                    {sortedTasks.map((task, index) => (
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

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleDragEnd = (result: DropResult) => {
    console.log("drag end", result);
  };

  return (
    <div>
      {data ? (
        <>
          <h1>Project: {data.project.title}</h1>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="board" direction="horizontal">
              {(provided) => {
                return (
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-3 gap-4"
                  >
                    {data.project.columns.map((column, index) => (
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
