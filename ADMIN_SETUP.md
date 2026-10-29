# Store administration

The protected admin portal is at `/admin`. It manages orders, products, on-site banners, the media library, and content image/video slots. Product prices and order totals are stored as integer paisa. Checkout accepts cash on delivery and Pakistani delivery addresses only.

## First-time setup

1. Use a Neon database and bucket configured in `.env.local`. The schema is applied by `npm run db:migrate`; `npm run db:seed` adds the seven categories and 26 original products without overwriting existing records.
2. Check every product's stock in Admin → Products. The seed uses **25 as a placeholder**, not a verified inventory count.
3. Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` of at least 12 characters in `.env.local`, then run `npm run db:seed-admin`. The script stores a scrypt hash and signs out prior sessions. You can remove the password from `.env.local` afterwards. Never commit `.env.local` or share its contents.
4. Start the app with `npm run dev` and sign in at `/admin/login`. Upload images under Media, then select them in Products, Banners or Content. Set video slots using a YouTube URL.

`.env.example` lists all required variable names. `DATABASE_URL` is the Neon Postgres URL; `DATABASE_URL_UNPOOLED` is optional for migrations. `AUTH_SECRET` is a random secret of at least 32 characters used for session and rate-limit hashes. `MEDIA_STORAGE=neon` uses `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` for Neon Object Storage. The bucket must have public-read access for storefront images. In development only, `MEDIA_STORAGE=local` stores files in ignored `public/uploads`; local storage is not a production option.

The image upload limit is 4 MB. JPEG, PNG, WebP and AVIF are accepted, and alt text is required. JPEG EXIF and IPTC metadata are stripped. Images in other formats can retain metadata, so remove sensitive metadata before uploading.

Admin changes expire the corresponding storefront cache. Scheduled banner activation and expiry can take up to roughly an hour to appear because banner selection is cached. Blog posts themselves are maintained in code; their cover and author images are editable in Content.

## Operational notes

- Order status transitions are forward-only; cancelling an open order restores its stock. The admin retains order snapshots and status history.
- The initial test project contains a cancelled, clearly marked test order, an inactive test announcement and a test image. They are not real sales or promotions.
- `.env.local` is ignored by Git. Treat the database and storage credentials as secrets. A separate `PREVIOUS_` group in that file preserves prior connection settings for rollback; use the new values by default.
- Neon free-plan limits can change. Check current database and object-storage allowances in the Neon console before going live, and monitor usage. A hosting plan suitable for a commercial store is still needed; no deployment is performed by this setup.
- Login throttling uses the forwarded client IP supplied by the hosting proxy. Deploy behind a trusted proxy that overwrites untrusted forwarded-IP headers.
