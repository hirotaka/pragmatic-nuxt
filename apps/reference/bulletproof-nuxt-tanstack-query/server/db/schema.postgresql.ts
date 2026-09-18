import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Use crypto.randomUUID() for Cloudflare Workers compatibility.
const generateId = () => crypto.randomUUID();

// Keep the application role contract aligned with the SQLite schema.
export const roleEnum = ["USER", "ADMIN"] as const;
export type Role = (typeof roleEnum)[number];

export const teams = pgTable(
  "Team",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    name: text("name").notNull().unique(),
    createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  table => ({
    nameIdx: index("Team_name_idx").on(table.name),
  }),
);

export const users = pgTable(
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
    createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  table => ({
    emailIdx: index("User_email_idx").on(table.email),
    teamIdIdx: index("User_teamId_idx").on(table.teamId),
  }),
);

export const discussions = pgTable(
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
    createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true })
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

export const comments = pgTable(
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
    createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true })
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
