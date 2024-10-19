import { gql } from "./__generated__/gql";

export const GET_PROJECTS = gql(`
  query GetProjects {
    projects {
      __typename
      id
      title
      columns {
        id
      }
    }
  }
`);

export const GET_PROJECT = gql(`
  query GetProject($projectId: ID!) {
    project(id: $projectId) {
      __typename
      title
      columns {
        __typename
        title
        id
        position
        project {
          id
          __typename
        }
        tasks {
          __typename
          id
          title
          position
          column {
            __typename
            id
          }
        }
      }
    }
  }
`);
