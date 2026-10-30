CREATE TABLE "blog_visits" (
	"id" uuid PRIMARY KEY NOT NULL,
	"post_id" uuid NOT NULL,
	"engaged_seconds" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_visits_engagement_range" CHECK ("blog_visits"."engaged_seconds" >= 0 and "blog_visits"."engaged_seconds" <= 1800)
);
--> statement-breakpoint
ALTER TABLE "blog_visits" ADD CONSTRAINT "blog_visits_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_visits_post_idx" ON "blog_visits" USING btree ("post_id");