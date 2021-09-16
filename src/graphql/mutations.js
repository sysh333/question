/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createSourceTable = /* GraphQL */ `
  mutation CreateSourceTable(
    $input: CreateSourceTableInput!
    $condition: ModelsourceTableConditionInput
  ) {
    createSourceTable(input: $input, condition: $condition) {
      title
      category
      date
      url
      createdAt
      updatedAt
    }
  }
`;
export const updateSourceTable = /* GraphQL */ `
  mutation UpdateSourceTable(
    $input: UpdateSourceTableInput!
    $condition: ModelsourceTableConditionInput
  ) {
    updateSourceTable(input: $input, condition: $condition) {
      title
      category
      date
      url
      createdAt
      updatedAt
    }
  }
`;
export const deleteSourceTable = /* GraphQL */ `
  mutation DeleteSourceTable(
    $input: DeleteSourceTableInput!
    $condition: ModelsourceTableConditionInput
  ) {
    deleteSourceTable(input: $input, condition: $condition) {
      title
      category
      date
      url
      createdAt
      updatedAt
    }
  }
`;
export const createTargetTable = /* GraphQL */ `
  mutation CreateTargetTable(
    $input: CreateTargetTableInput!
    $condition: ModeltargetTableConditionInput
  ) {
    createTargetTable(input: $input, condition: $condition) {
      id
      title
      category
      updatedAt
      createdAt
    }
  }
`;
export const updateTargetTable = /* GraphQL */ `
  mutation UpdateTargetTable(
    $input: UpdateTargetTableInput!
    $condition: ModeltargetTableConditionInput
  ) {
    updateTargetTable(input: $input, condition: $condition) {
      id
      title
      category
      updatedAt
      createdAt
    }
  }
`;
export const deleteTargetTable = /* GraphQL */ `
  mutation DeleteTargetTable(
    $input: DeleteTargetTableInput!
    $condition: ModeltargetTableConditionInput
  ) {
    deleteTargetTable(input: $input, condition: $condition) {
      id
      title
      category
      updatedAt
      createdAt
    }
  }
`;
