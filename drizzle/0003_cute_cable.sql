CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"quote" text NOT NULL,
	"rating" double precision NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "testimonials_rating_range" CHECK ("testimonials"."rating" >= 1 and "testimonials"."rating" <= 5),
	CONSTRAINT "testimonials_name_not_blank" CHECK (length(trim("testimonials"."name")) > 0),
	CONSTRAINT "testimonials_quote_not_blank" CHECK (length(trim("testimonials"."quote")) > 0)
);
--> statement-breakpoint
CREATE INDEX "testimonials_active_order_idx" ON "testimonials" USING btree ("is_active","sort_order");