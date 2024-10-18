import { gql } from "./__generated__/gql";

export const GET_PROJECTS = gql(`
  query GetProjects {
    projects {
      id
      title
      __typename
    }
  }
`);

export const GET_PROJECT = gql(`
  query GetProject($projectId: ID!) {
    project(id: $projectId) {
      title
      columns {
        title
        id
        tasks {
          id
          title
          position
        }
      }
    }
  }
`);
