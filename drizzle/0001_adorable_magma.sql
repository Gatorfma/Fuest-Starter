CREATE TABLE IF NOT EXISTS "fuest_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fuest_post" ADD CONSTRAINT "fuest_post_created_by_fuest_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."fuest_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
