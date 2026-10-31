# Store administration

The protected admin portal is at `/admin`. It manages orders, contact messages, products, categories, blog posts, testimonials, on-site banners, the media library, and content image/video slots. Product prices and order totals are stored as integer paisa. Checkout accepts cash on delivery and Pakistani delivery addresses only.

## First-time setup

1. Use a Neon database and bucket configured in `.env.local`. The schema is applied by `npm run db:migrate`; `npm run db:seed` adds the seven categories and 26 original products without overwriting existing records. On an initial setup, run `npm run db:seed-blog` and `npm run db:seed-testimonials` once to import the original posts and testimonials. Re-running these imports can recreate deleted original content. The original testimonials are illustrative placeholders and should be replaced with genuine customer feedback before launch.
2. Check every product's stock in Admin → Products. The seed uses **25 as a placeholder**, not a verified inventory count.
3. Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` of at least 12 characters in `.env.local`, then run `npm run db:seed-admin`. The script stores a scrypt hash and signs out prior sessions. You can remove the password from `.env.local` afterwards. Never commit `.env.local` or share its contents.
4. Start the app with `npm run dev` and sign in at `/admin/login`. Choose or upload images directly in Products, Categories, Blog, Banners or Content; uploads are also saved in Media. Set video slots using a YouTube URL.

`.env.example` lists all required variable names. `DATABASE_URL` is the Neon Postgres URL; `DATABASE_URL_UNPOOLED` is optional for migrations. `AUTH_SECRET` is a random secret of at least 32 characters used for session and rate-limit hashes. `MEDIA_STORAGE=neon` uses `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` for Neon Object Storage. The bucket must have public-read access for storefront images. In development only, `MEDIA_STORAGE=local` stores files in ignored `public/uploads`; local storage is not a production option.

The image upload limit is 4 MB. JPEG, PNG, WebP and AVIF are accepted, and alt text is required. JPEG EXIF and IPTC metadata are stripped. Images in other formats can retain metadata, so remove sensitive metadata before uploading.

Admin changes expire the corresponding storefront cache. Scheduled banner activation and expiry can take up to roughly an hour to appear because banner selection is cached. Manage articles and their cover images under Admin → Blog; the shared author image remains editable in Content. Publication dates control display order and do not schedule posts.

Manage categories under Admin → Categories. Active categories appear in the Shop menu when they contain an active product. Turning off a category hides all of its products from the storefront. To delete a category, first move or delete every product assigned to it, including inactive products. Changing a category slug changes its storefront links.

Manage testimonials under Admin → Testimonials. Only testimonials marked visible appear on the home and about pages; the display order controls their initial order. New testimonials start hidden until explicitly made visible.

Blog statistics start from zero when tracking is installed; the sample view counts are not included. Admin → Blog shows anonymous views and average and total active time. A view is counted after the article has been visible for two seconds; repeated visits in the same browser tab within 30 minutes share one visit. Time pauses in background tabs, when the article is off screen, or after 60 seconds without interaction, and is capped at 30 minutes per visit. Browser privacy settings and blockers can prevent tracking, and automated or manipulated traffic cannot be eliminated completely.

## Operational notes

- Order status transitions are forward-only; cancelling an open order restores its stock. The admin retains order snapshots and status history.
- Orders remain pending until an admin confirms them. Confirmed orders have a print-friendly shipping sheet; printing does not change the order status. The order list can copy the customer's shipping details.
- Open orders (pending, confirmed, shipped) default to all dates, so an older pending order is never hidden; delivered and cancelled orders default to today in Pakistan time. Use Order dates to show today, all dates or an inclusive date range; a date you choose carries across status tabs and pagination, and each tab count matches the list it opens. The Overview and the nav badge count all pending orders.
- On an order, one button moves it to the next status (Mark as confirmed, shipped, delivered). Cancelling is a separate, confirmed action that returns the items to stock. Call and WhatsApp links sit next to the customer's phone number.
- Contact form enquiries are saved under Admin → Messages. Review the inbox regularly; no automatic email notification or reply is sent. Messages submitted before storage was added cannot be recovered from the form. The privacy policy calls for deletion after 24 months unless the enquiry relates to an open issue: review and delete eligible messages in the inbox, and handle individual deletion requests there. Deletion is manual; there is no automatic retention scheduler.
- In Admin → Settings, set an order WhatsApp number to offer a prefilled WhatsApp message after successful checkout. The customer reviews the complete order and must tap Send in WhatsApp; placing the order itself does not guarantee a WhatsApp message was sent. A confirmation-page link is available if a browser blocks the new window. No WhatsApp API credentials are needed for this customer-initiated flow.
- The initial test project contains a cancelled, clearly marked test order, an inactive test announcement and a test image. They are not real sales or promotions.
- `.env.local` is ignored by Git. Treat the database and storage credentials as secrets. A separate `PREVIOUS_` group in that file preserves prior connection settings for rollback; use the new values by default.
- Neon free-plan limits can change. Check current database and object-storage allowances in the Neon console before going live, and monitor usage. A hosting plan suitable for a commercial store is still needed; no deployment is performed by this setup.
- Login throttling uses the forwarded client IP supplied by the hosting proxy. Deploy behind a trusted proxy that overwrites untrusted forwarded-IP headers. Sign-in is blocked for 15 minutes after 5 failed attempts for one email from the same IP, 20 failed attempts from one IP, or 50 failed attempts for one email from any IP, so someone guessing from elsewhere cannot lock the owner out with a handful of tries.
