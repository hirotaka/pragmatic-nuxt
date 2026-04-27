import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Use crypto.randomUUID() for Cloudflare Workers compatibility
// cuid2 initializes crypto at module load time which breaks Cloudflare Workers
const generateId = () => crypto.randomUUID();

// Enum for user roles
export const roleEnum = ["USER", "ADMIN"] as const;
export type Role = (typeof roleEnum)[number];

// Teams table
export const teams = sqliteTable(
  "Team",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    name: text("name").notNull().unique(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  table => ({
    nameIdx: index("Team_name_idx").on(table.name),
  }),
);

// Users table
export const users = sqliteTable(
  "User",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    email: text("email").notNull().unique(),
    firstName: text("firstName").notNull(),
    lastName: text("lastName").notNull(),
    bio: text("bio"),
    password: text("password").notNull(),
    role: text("role", { enum: roleEnum }).notNull().default("USER"),
    teamId: text("teamId")
      .notNull()
      .references(() => teams.id, { onDelete: "restrict" }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  table => ({
    emailIdx: index("User_email_idx").on(table.email),
    teamIdIdx: index("User_teamId_idx").on(table.teamId),
  }),
);

// Discussions table
export const discussions = sqliteTable(
  "Discussion",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    title: text("title").notNull(),
    body: text("body").notNull(),
    authorId: text("authorId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamId: text("teamId")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  table => ({
    authorIdIdx: index("Discussion_authorId_idx").on(table.authorId),
    teamIdIdx: index("Discussion_teamId_idx").on(table.teamId),
    createdAtIdx: index("Discussion_createdAt_idx").on(table.createdAt),
  }),
);

// Comments table
export const comments = sqliteTable(
  "Comment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    body: text("body").notNull(),
    discussionId: text("discussionId")
      .notNull()
      .references(() => discussions.id, { onDelete: "cascade" }),
    authorId: text("authorId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  table => ({
    discussionIdIdx: index("Comment_discussionId_idx").on(table.discussionId),
    authorIdIdx: index("Comment_authorId_idx").on(table.authorId),
    createdAtIdx: index("Comment_createdAt_idx").on(table.createdAt),
  }),
);

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
  users: many(users),
  discussions: many(discussions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id],
  }),
  discussions: many(discussions),
  comments: many(comments),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  author: one(users, {
    fields: [discussions.authorId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [discussions.teamId],
    references: [teams.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  discussion: one(discussions, {
    fields: [comments.discussionId],
    references: [discussions.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type Discussion = typeof discussions.$inferSelect;
export type NewDiscussion = typeof discussions.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
