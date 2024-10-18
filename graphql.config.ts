import type { IGraphQLConfig } from "graphql-config";

const config: IGraphQLConfig = {
  schema: "http://localhost:4000",
  documents: "src/**/*.{js,jsx,ts,tsx}",
};

export default config;
