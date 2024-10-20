import { useMutation, useQuery } from "@apollo/client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";

enum DROPPABLE_TYPE {
  COLUMN = "COLUMN",
  TASK = "TASK",
}

export const Route = createFileRoute("/$projectId")({
  component: ProjectComponent,
});

function sortByPosition<T extends { position: string }>(a: T, b: T) {
  if (a.position < b.position) {
    return -1;
  }
  if (b.position < a.position) {
    return 1;
  }
  return 0;
}

type Column = GetProjectQuery["project"]["columns"][number];
type Task = Column["tasks"][number];

const getSortedColumns = (columns: Column[]) => {
  const sortedColumns = [...columns].sort(sortByPosition);
  return sortedColumns.map((column) => {
    const sortedTasks = [...column.tasks].sort(sortByPosition);
    return {
      ...column,
      tasks: sortedTasks,
    };
  });
};

function Task({ task, className }: { task: Task; className?: string }) {
  const [deleteTask] = useMutation(
    gql(`
    mutation DeleteTask($taskId: String!) {
      deleteTask(id: $taskId) {
        id
      }
    }
`),
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className={cn(className)}>
          <CardHeader>{task.title}</CardHeader>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => {
            deleteTask({
              variables: {
                taskId: task.id,
              },
              update: (cache) => {
                cache.modify({
                  id: cache.identify(task.column),
                  fields: {
                    tasks: (existingTasks, { readField }) => {
                      const filteredTasks = existingTasks.filter(
                        (taskRef) => task.id !== readField("id", taskRef),
                      );
                      return filteredTasks;
                    },
                  },
                });
              },
            });
          }}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

const addTaskSchema = z.object({
  title: z.string().min(1),
});

function AddTaskModal({ column }: { column: Column }) {
  const [open, setIsOpen] = useState(false);

  const [addTask] = useMutation(
    gql(`
    mutation AddTask($columnId: String!, $title: String!, $position: String!) {
      createTask(columnId: $columnId, title: $title, position: $position) {
        id
        position
        title
        column {
          id
        },
      }
    }`),
    {
      update: (cache, { data }) => {
        console.log("update", data);
        cache.modify({
          id: cache.identify(column),
          fields: {
            tasks: (existingTasks = []) => {
              const newTaskRef = cache.writeFragment({
                data: data.createTask,
                fragment: gql(`
                  fragment NewTask on Task {
                    id
                    title
                    position
                    column {
                      id
                    }
                  }
                `),
              });

              return [...existingTasks, newTaskRef];
            },
          },
        });
      },
    },
  );

  const handleSubmit = (values: z.infer<typeof addTaskSchema>) => {
    const { title } = values;

    const newTaskPosition = generateKeyBetween(
      column.tasks.at(-1)?.position,
      undefined,
    );

    addTask({
      variables: {
        columnId: column.id,
        title,
        position: newTaskPosition,
      },
      optimisticResponse: {
        __typename: "Mutation",
        createTask: {
          __typename: "Task",
          id: "optimistic",
          position: newTaskPosition,
          title,
          column: {
            id: column.id,
          },
        },
      },
    });
  };

  const form = useForm<z.infer<typeof addTaskSchema>>({
    resolver: zodResolver(addTaskSchema),
  });

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(open) => {
          setIsOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <Button
            onClick={() => setIsOpen(true)}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            Add new task
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new task</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task title</FormLabel>
                    <FormControl>
                      <Input {...field} name="title" type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Add task</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Column({
  column,
  index,
  className,
}: {
  column: GetProjectQuery["project"]["columns"][number];
  index: number;
  className?: string;
}) {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(colDraggableProvided, snapshot) => {
        return (
          <li
            {...colDraggableProvided.draggableProps}
            {...colDraggableProvided.dragHandleProps}
            ref={colDraggableProvided.innerRef}
            className={cn("bg-gray-100 p-4 rounded-xl", className, {
              "shadow-lg scale-105": snapshot.isDragging,
              "shadow-sm scale-100": snapshot.isDropAnimating,
            })}
          >
            <h2 className="font-medium mb-3">{column.title}</h2>
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
                              <Task
                                task={task}
                                className={cn("transition", {
                                  "shadow-lg scale-105": snapshot.isDragging,
                                  "!rotate-0 shadow-sm scale-100":
                                    snapshot.isDropAnimating,
                                })}
                              />
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
            <AddTaskModal column={column} />
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
    fetchPolicy: "cache-and-network",
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

  const [updateColumn] = useMutation(
    gql(`
    mutation UpdateColumn($updateColumnId: String!, $position: String, $title: String) {
      updateColumn(id: $updateColumnId, position: $position, title: $title) {
        __typename
        id
        position
      }
    }`),
  );

  if (projectQuery.loading && !projectQuery.data) {
    return <div>Loading...</div>;
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
      const columnId = result.draggableId;
      const droppedIndex = result.destination.index;

      const filteredColumns = sortedColumns.filter(
        (column) => column.id !== columnId,
      );

      const columnsAfterDrop = [
        ...filteredColumns.slice(0, droppedIndex),
        {
          id: columnId,
          position: undefined,
        },
        ...filteredColumns.slice(droppedIndex),
      ];

      const previousColumnPosition = columnsAfterDrop[droppedIndex - 1]
        ? columnsAfterDrop[droppedIndex - 1].position
        : undefined;

      const nextColumnPosition = columnsAfterDrop[droppedIndex + 1]
        ? columnsAfterDrop[droppedIndex + 1].position
        : undefined;

      const newPosition = generateKeyBetween(
        previousColumnPosition,
        nextColumnPosition,
      );

      updateColumn({
        variables: {
          updateColumnId: columnId,
          position: newPosition,
        },
        optimisticResponse: {
          __typename: "Mutation",
          updateColumn: {
            __typename: "Column",
            id: columnId,
            position: newPosition,
          },
        },
      });
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
          <h1 className="mb-8 text-3xl">{projectQuery.data.project.title}</h1>
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
                    className={cn("grid", `grid-cols-${sortedColumns.length}`)}
                  >
                    {sortedColumns.map((column, index) => (
                      <Column
                        className="mr-4"
                        key={column.id}
                        column={column}
                        index={index}
                      />
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
