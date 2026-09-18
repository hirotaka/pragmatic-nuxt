CREATE TABLE "Comment" (
	"id" text PRIMARY KEY NOT NULL,
	"body" text NOT NULL,
	"discussionId" text NOT NULL,
	"authorId" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Discussion" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"authorId" text NOT NULL,
	"teamId" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Team" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "Team_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"bio" text,
	"password" text NOT NULL,
	"role" text DEFAULT 'USER' NOT NULL,
	"teamId" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_discussionId_Discussion_id_fk" FOREIGN KEY ("discussionId") REFERENCES "public"."Discussion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_User_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_authorId_User_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_teamId_Team_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_Team_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Comment_discussionId_idx" ON "Comment" USING btree ("discussionId");--> statement-breakpoint
CREATE INDEX "Comment_authorId_idx" ON "Comment" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "Comment_createdAt_idx" ON "Comment" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "Discussion_authorId_idx" ON "Discussion" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "Discussion_teamId_idx" ON "Discussion" USING btree ("teamId");--> statement-breakpoint
CREATE INDEX "Discussion_createdAt_idx" ON "Discussion" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "Team_name_idx" ON "Team" USING btree ("name");--> statement-breakpoint
CREATE INDEX "User_email_idx" ON "User" USING btree ("email");--> statement-breakpoint
CREATE INDEX "User_teamId_idx" ON "User" USING btree ("teamId");