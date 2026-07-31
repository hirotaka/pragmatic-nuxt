import * as generatedSchema from "@nuxthub/db/schema";
import { getTableColumns, getTableName } from "drizzle-orm";
import {
  createTableRelationsHelpers,
  extractTablesRelationalConfig,
  One,
} from "drizzle-orm/relations";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { describe, expect, test } from "vitest";
import {
  comments,
  commentsRelations,
  discussions,
  discussionsRelations,
  roleEnum,
  teams,
  teamsRelations,
  users,
  usersRelations,
} from "../schema";

const tables = { teams, users, discussions, comments };

describe("database schema", () => {
  test("exposes the complete schema through the generated NuxtHub package", () => {
    expect(Object.keys(generatedSchema)).toEqual(expect.arrayContaining([
      "teams",
      "users",
      "discussions",
      "comments",
      "teamsRelations",
      "usersRelations",
      "discussionsRelations",
      "commentsRelations",
    ]));

    expect([
      generatedSchema.teams,
      generatedSchema.users,
      generatedSchema.discussions,
      generatedSchema.comments,
    ].map(getTableName).sort()).toEqual([
      "Comment",
      "Discussion",
      "Team",
      "User",
    ]);
    expect([
      generatedSchema.teamsRelations,
      generatedSchema.usersRelations,
      generatedSchema.discussionsRelations,
      generatedSchema.commentsRelations,
    ]).not.toContain(undefined);
  });

  test("keeps the domain table and role names", () => {
    expect(Object.values(tables).map(getTableName).sort()).toEqual([
      "Comment",
      "Discussion",
      "Team",
      "User",
    ]);
    expect(roleEnum).toEqual(["USER", "ADMIN"]);
  });

  test("keeps every source column and its required constraints", () => {
    expect(Object.fromEntries(
      Object.entries(tables).map(([tableName, table]) => [
        tableName,
        Object.values(getTableColumns(table)).map(column => ({
          name: column.name,
          primary: column.primary,
          notNull: column.notNull,
        })),
      ]),
    )).toEqual({
      teams: [
        { name: "id", primary: true, notNull: true },
        { name: "name", primary: false, notNull: true },
        { name: "createdAt", primary: false, notNull: true },
        { name: "updatedAt", primary: false, notNull: true },
      ],
      users: [
        { name: "id", primary: true, notNull: true },
        { name: "email", primary: false, notNull: true },
        { name: "firstName", primary: false, notNull: true },
        { name: "lastName", primary: false, notNull: true },
        { name: "bio", primary: false, notNull: false },
        { name: "password", primary: false, notNull: true },
        { name: "role", primary: false, notNull: true },
        { name: "teamId", primary: false, notNull: true },
        { name: "createdAt", primary: false, notNull: true },
        { name: "updatedAt", primary: false, notNull: true },
      ],
      discussions: [
        { name: "id", primary: true, notNull: true },
        { name: "title", primary: false, notNull: true },
        { name: "body", primary: false, notNull: true },
        { name: "authorId", primary: false, notNull: true },
        { name: "teamId", primary: false, notNull: true },
        { name: "createdAt", primary: false, notNull: true },
        { name: "updatedAt", primary: false, notNull: true },
      ],
      comments: [
        { name: "id", primary: true, notNull: true },
        { name: "body", primary: false, notNull: true },
        { name: "discussionId", primary: false, notNull: true },
        { name: "authorId", primary: false, notNull: true },
        { name: "createdAt", primary: false, notNull: true },
        { name: "updatedAt", primary: false, notNull: true },
      ],
    });
  });

  test("keeps source defaults, update functions, and Date mappings", () => {
    expect(users.role.default).toBe("USER");

    for (const table of Object.values(tables)) {
      const columns = getTableColumns(table);

      expect(columns.id.defaultFn?.()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(columns.createdAt.defaultFn?.()).toBeInstanceOf(Date);
      expect(columns.updatedAt.defaultFn?.()).toBeInstanceOf(Date);
      expect(columns.updatedAt.onUpdateFn?.()).toBeInstanceOf(Date);
      expect(columns.createdAt.mapFromDriverValue(0)).toBeInstanceOf(Date);
      expect(columns.updatedAt.mapFromDriverValue(0)).toBeInstanceOf(Date);
    }
  });

  test("keeps unique fields and query indexes", () => {
    expect(teams.name.isUnique).toBe(true);
    expect(users.email.isUnique).toBe(true);

    expect(Object.fromEntries(
      Object.entries(tables).map(([name, table]) => [
        name,
        getTableConfig(table).indexes.map(index => index.config.name).sort(),
      ]),
    )).toEqual({
      teams: ["Team_name_idx"],
      users: ["User_email_idx", "User_teamId_idx"],
      discussions: [
        "Discussion_authorId_idx",
        "Discussion_createdAt_idx",
        "Discussion_teamId_idx",
      ],
      comments: [
        "Comment_authorId_idx",
        "Comment_createdAt_idx",
        "Comment_discussionId_idx",
      ],
    });
  });

  test("keeps foreign-key targets and delete actions", () => {
    const foreignKeys = Object.values(tables).flatMap(table =>
      getTableConfig(table).foreignKeys.map((foreignKey) => {
        const reference = foreignKey.reference();

        return {
          from: `${getTableName(table)}.${reference.columns[0]?.name}`,
          to: `${getTableName(reference.foreignTable)}.${reference.foreignColumns[0]?.name}`,
          onDelete: foreignKey.onDelete,
        };
      }),
    ).sort((left, right) => left.from.localeCompare(right.from));

    expect(foreignKeys).toEqual([
      { from: "Comment.authorId", to: "User.id", onDelete: "cascade" },
      { from: "Comment.discussionId", to: "Discussion.id", onDelete: "cascade" },
      { from: "Discussion.authorId", to: "User.id", onDelete: "cascade" },
      { from: "Discussion.teamId", to: "Team.id", onDelete: "cascade" },
      { from: "User.teamId", to: "Team.id", onDelete: "restrict" },
    ]);
  });

  test("keeps the relational query graph", () => {
    const { tables: relationalTables } = extractTablesRelationalConfig({
      ...tables,
      teamsRelations,
      usersRelations,
      discussionsRelations,
      commentsRelations,
    }, createTableRelationsHelpers);

    expect(Object.fromEntries(
      Object.entries(relationalTables).map(([name, table]) => [
        name,
        Object.fromEntries(
          Object.entries(table.relations).map(([relationName, relation]) => [
            relationName,
            relation.referencedTableName,
          ]),
        ),
      ]),
    )).toEqual({
      teams: { users: "User", discussions: "Discussion" },
      users: { team: "Team", discussions: "Discussion", comments: "Comment" },
      discussions: { author: "User", team: "Team", comments: "Comment" },
      comments: { discussion: "Discussion", author: "User" },
    });

    const oneRelationJoins = Object.entries(relationalTables).flatMap(
      ([tableName, table]) => Object.entries(table.relations).flatMap(
        ([relationName, relation]) => {
          if (!(relation instanceof One) || !relation.config) {
            return [];
          }

          return [{
            relation: `${tableName}.${relationName}`,
            fields: relation.config.fields.map(column => `${getTableName(column.table)}.${column.name}`),
            references: relation.config.references.map(column => `${getTableName(column.table)}.${column.name}`),
          }];
        },
      ),
    );

    expect(oneRelationJoins).toEqual([
      { relation: "users.team", fields: ["User.teamId"], references: ["Team.id"] },
      { relation: "discussions.author", fields: ["Discussion.authorId"], references: ["User.id"] },
      { relation: "discussions.team", fields: ["Discussion.teamId"], references: ["Team.id"] },
      { relation: "comments.discussion", fields: ["Comment.discussionId"], references: ["Discussion.id"] },
      { relation: "comments.author", fields: ["Comment.authorId"], references: ["User.id"] },
    ]);
  });
});
