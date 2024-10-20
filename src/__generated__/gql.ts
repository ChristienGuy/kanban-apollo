/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    "\n  query GetProjects {\n    projects {\n      __typename\n      id\n      title\n      columns {\n        id\n      }\n    }\n  }\n": types.GetProjectsDocument,
    "\n  query GetProject($projectId: ID!) {\n    project(id: $projectId) {\n      __typename\n      id\n      title\n      columns {\n        __typename\n        title\n        id\n        position\n        tasks {\n          __typename\n          id\n          title\n          position\n          column {\n            id\n          }\n        }\n      }\n    }\n  }\n": types.GetProjectDocument,
    "\n    mutation DeleteTask($taskId: String!) {\n      deleteTask(id: $taskId) {\n        id\n      }\n    }\n": types.DeleteTaskDocument,
    "\n    mutation AddTask($columnId: String!, $title: String!, $position: String!) {\n      createTask(columnId: $columnId, title: $title, position: $position) {\n        id\n        position\n        title\n        column {\n          id\n        },\n      }\n    }": types.AddTaskDocument,
    "\n                  fragment NewTask on Task {\n                    id\n                    title\n                    position\n                    column {\n                      id\n                    }\n                  }\n                ": types.NewTaskFragmentDoc,
    "\n    mutation UpdateTask($updateTaskId: String!, $position: String, $title: String, $columnId: String) {\n      updateTask(id: $updateTaskId, position: $position, title: $title, columnId: $columnId) {\n        __typename\n        id\n        position\n      }\n    }": types.UpdateTaskDocument,
    "\n    mutation UpdateColumn($updateColumnId: String!, $position: String, $title: String) {\n      updateColumn(id: $updateColumnId, position: $position, title: $title) {\n        __typename\n        id\n        position\n      }\n    }": types.UpdateColumnDocument,
    "\n                      fragment NewColumn on Column {\n                        id\n                        title\n                        position\n                        tasks {\n                          id\n                          title\n                          position\n                        }\n                      }\n                    ": types.NewColumnFragmentDoc,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetProjects {\n    projects {\n      __typename\n      id\n      title\n      columns {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetProjects {\n    projects {\n      __typename\n      id\n      title\n      columns {\n        id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetProject($projectId: ID!) {\n    project(id: $projectId) {\n      __typename\n      id\n      title\n      columns {\n        __typename\n        title\n        id\n        position\n        tasks {\n          __typename\n          id\n          title\n          position\n          column {\n            id\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetProject($projectId: ID!) {\n    project(id: $projectId) {\n      __typename\n      id\n      title\n      columns {\n        __typename\n        title\n        id\n        position\n        tasks {\n          __typename\n          id\n          title\n          position\n          column {\n            id\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation DeleteTask($taskId: String!) {\n      deleteTask(id: $taskId) {\n        id\n      }\n    }\n"): (typeof documents)["\n    mutation DeleteTask($taskId: String!) {\n      deleteTask(id: $taskId) {\n        id\n      }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation AddTask($columnId: String!, $title: String!, $position: String!) {\n      createTask(columnId: $columnId, title: $title, position: $position) {\n        id\n        position\n        title\n        column {\n          id\n        },\n      }\n    }"): (typeof documents)["\n    mutation AddTask($columnId: String!, $title: String!, $position: String!) {\n      createTask(columnId: $columnId, title: $title, position: $position) {\n        id\n        position\n        title\n        column {\n          id\n        },\n      }\n    }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n                  fragment NewTask on Task {\n                    id\n                    title\n                    position\n                    column {\n                      id\n                    }\n                  }\n                "): (typeof documents)["\n                  fragment NewTask on Task {\n                    id\n                    title\n                    position\n                    column {\n                      id\n                    }\n                  }\n                "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation UpdateTask($updateTaskId: String!, $position: String, $title: String, $columnId: String) {\n      updateTask(id: $updateTaskId, position: $position, title: $title, columnId: $columnId) {\n        __typename\n        id\n        position\n      }\n    }"): (typeof documents)["\n    mutation UpdateTask($updateTaskId: String!, $position: String, $title: String, $columnId: String) {\n      updateTask(id: $updateTaskId, position: $position, title: $title, columnId: $columnId) {\n        __typename\n        id\n        position\n      }\n    }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation UpdateColumn($updateColumnId: String!, $position: String, $title: String) {\n      updateColumn(id: $updateColumnId, position: $position, title: $title) {\n        __typename\n        id\n        position\n      }\n    }"): (typeof documents)["\n    mutation UpdateColumn($updateColumnId: String!, $position: String, $title: String) {\n      updateColumn(id: $updateColumnId, position: $position, title: $title) {\n        __typename\n        id\n        position\n      }\n    }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n                      fragment NewColumn on Column {\n                        id\n                        title\n                        position\n                        tasks {\n                          id\n                          title\n                          position\n                        }\n                      }\n                    "): (typeof documents)["\n                      fragment NewColumn on Column {\n                        id\n                        title\n                        position\n                        tasks {\n                          id\n                          title\n                          position\n                        }\n                      }\n                    "];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;