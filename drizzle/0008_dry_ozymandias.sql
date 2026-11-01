ALTER TYPE "public"."banner_placement" ADD VALUE 'popup';--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "youtube_id" text;--> statement-breakpoint
ALTER TABLE "banners" ADD CONSTRAINT "banners_youtube_id_format" CHECK ("banners"."youtube_id" is null or "banners"."youtube_id" ~ '^[A-Za-z0-9_-]{11}$');