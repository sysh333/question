/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSourceTable = /* GraphQL */ `
  query GetSourceTable($title: String!) {
    getSourceTable(title: $title) {
      title
      category
      date
      url
      createdAt
      updatedAt
    }
  }
`;
export const listSourceTables = /* GraphQL */ `
  query ListSourceTables(
    $title: String
    $filter: ModelsourceTableFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listSourceTables(
      title: $title
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        title
        category
        date
        url
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getTargetTable = /* GraphQL */ `
  query GetTargetTable($id: ID!) {
    getTargetTable(id: $id) {
      id
      title
      category
      updatedAt
      createdAt
    }
  }
`;
export const listTargetTables = /* GraphQL */ `
  query ListTargetTables(
    $filter: ModeltargetTableFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTargetTables(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        category
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
