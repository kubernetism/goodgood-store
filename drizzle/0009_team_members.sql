CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"photo_id" uuid,
	"email" text,
	"phone" text,
	"phone_on_whatsapp" boolean DEFAULT false NOT NULL,
	"facebook_url" text,
	"instagram_url" text,
	"linkedin_url" text,
	"x_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_name_not_blank" CHECK (length(trim("team_members"."name")) > 0),
	CONSTRAINT "team_members_role_not_blank" CHECK (length(trim("team_members"."role")) > 0),
	CONSTRAINT "team_members_email_lowercase" CHECK ("team_members"."email" is null or "team_members"."email" = lower("team_members"."email")),
	CONSTRAINT "team_members_phone_e164" CHECK ("team_members"."phone" is null or "team_members"."phone" ~ '^\+[1-9][0-9]{7,14}$'),
	CONSTRAINT "team_members_links_https" CHECK (("team_members"."facebook_url" is null or "team_members"."facebook_url" ~ '^https://') and ("team_members"."instagram_url" is null or "team_members"."instagram_url" ~ '^https://') and ("team_members"."linkedin_url" is null or "team_members"."linkedin_url" ~ '^https://') and ("team_members"."x_url" is null or "team_members"."x_url" ~ '^https://'))
);
--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "team_members_published_order_idx" ON "team_members" USING btree ("is_published","sort_order","created_at","id");