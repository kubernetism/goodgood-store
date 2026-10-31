ALTER TYPE "public"."order_status" ADD VALUE 'packed' BEFORE 'shipped';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'dispatched' BEFORE 'shipped';--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'footer' NOT NULL,
	"ip_hash" text,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_lowercase" CHECK ("newsletter_subscribers"."email" = lower("newsletter_subscribers"."email"))
);
--> statement-breakpoint
CREATE TABLE "order_lookup_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_events" ADD COLUMN "reason" text;--> statement-breakpoint
ALTER TABLE "order_events" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancel_reason" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancel_note" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "courier_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_number" text;--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscribers_email_unique" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "newsletter_subscribers_created_idx" ON "newsletter_subscribers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "newsletter_subscribers_ip_created_idx" ON "newsletter_subscribers" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "order_lookup_attempts_ip_created_idx" ON "order_lookup_attempts" USING btree ("ip_hash","created_at");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cancel_reason_only_when_cancelled" CHECK ("orders"."cancel_reason" is null or "orders"."status" = 'cancelled');