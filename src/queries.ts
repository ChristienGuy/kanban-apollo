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
