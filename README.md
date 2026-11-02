# Honey by Abdul Sami Enterprises

An online honey store for Pakistan with a private Admin Portal. Customers browse, order with cash on delivery and track their parcels. The shop owner manages products, orders, banners, blog posts and site content without touching code.

[![Home page](screenshots/readme/home-thumb.jpg)](screenshots/readme/home.jpg)

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Run it on your computer](#run-it-on-your-computer)
- [Deploy to production](#deploy-to-production)
- [Add a product](#add-a-product)
- [Manage products](#manage-products)
- [Go-live checklist](#go-live-checklist)
- [Commands](#commands)
- [Troubleshooting](#troubleshooting)

## Features

**Store**

- Shop with categories, filters and product detail pages
- Basket and checkout, with cash on delivery across Pakistan
- Order tracking with the order number and mobile number
- Order details sent over WhatsApp after checkout
- Blog, About and Contact pages, plus newsletter sign-up
- A share image for every product link pasted into WhatsApp or other chat apps

**Admin Portal (`/admin`)**

- Sales dashboard, with order, stock and message counts
- Orders: status updates, courier details, printable slips, call and WhatsApp links
- Products, categories, banners and pop-ups, blog, testimonials and team
- Media library, site images and videos, social links and newsletter export

## Screenshots

Click any image to see the full page. Customer details are hidden.

### Store

| | |
|---|---|
| **Home**<br>[![Home](screenshots/readme/home-thumb.jpg)](screenshots/readme/home.jpg) | **Shop**<br>[![Shop](screenshots/readme/shop-thumb.jpg)](screenshots/readme/shop.jpg) |
| **Product details**<br>[![Product details](screenshots/readme/product-thumb.jpg)](screenshots/readme/product.jpg) | **Basket**<br>[![Basket](screenshots/readme/cart-thumb.jpg)](screenshots/readme/cart.jpg) |
| **Checkout**<br>[![Checkout](screenshots/readme/checkout-thumb.jpg)](screenshots/readme/checkout.jpg) | **Order confirmation**<br>[![Order confirmation](screenshots/readme/thank-you-thumb.jpg)](screenshots/readme/thank-you.jpg) |
| **Track your order**<br>[![Track your order](screenshots/readme/track-order-thumb.jpg)](screenshots/readme/track-order.jpg) | **About**<br>[![About](screenshots/readme/about-thumb.jpg)](screenshots/readme/about.jpg) |
| **Blog**<br>[![Blog](screenshots/readme/blog-thumb.jpg)](screenshots/readme/blog.jpg) | **Contact**<br>[![Contact](screenshots/readme/contact-thumb.jpg)](screenshots/readme/contact.jpg) |

### Admin Portal

| | |
|---|---|
| **Dashboard**<br>[![Dashboard](screenshots/readme/admin-dashboard-thumb.jpg)](screenshots/readme/admin-dashboard.jpg) | **Orders**<br>[![Orders](screenshots/readme/admin-orders-thumb.jpg)](screenshots/readme/admin-orders.jpg) |
| **Products**<br>[![Products](screenshots/readme/admin-products-thumb.jpg)](screenshots/readme/admin-products.jpg) | **Categories**<br>[![Categories](screenshots/readme/admin-categories-thumb.jpg)](screenshots/readme/admin-categories.jpg) |
| **Banners and ads**<br>[![Banners and ads](screenshots/readme/admin-banners-thumb.jpg)](screenshots/readme/admin-banners.jpg) | **Blog**<br>[![Blog management](screenshots/readme/admin-blog-thumb.jpg)](screenshots/readme/admin-blog.jpg) |
| **Testimonials**<br>[![Testimonials](screenshots/readme/admin-testimonials-thumb.jpg)](screenshots/readme/admin-testimonials.jpg) | **Team**<br>[![Team](screenshots/readme/admin-team-thumb.jpg)](screenshots/readme/admin-team.jpg) |
| **Customer messages**<br>[![Customer messages](screenshots/readme/admin-messages-thumb.jpg)](screenshots/readme/admin-messages.jpg) | **Media library**<br>[![Media library](screenshots/readme/admin-media-thumb.jpg)](screenshots/readme/admin-media.jpg) |

## Tech stack

| Area | Used |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, with Sansation as the only font |
| Database | Neon Postgres with Drizzle ORM |
| Image storage | Neon Object Storage (S3-compatible) |
| Tests | Vitest |
| Hosting | Vercel recommended |

## Run it on your computer

You need [Node.js](https://nodejs.org) 20.9 or newer, and a free [Neon](https://neon.tech) account for the database.

**1. Download the code and install it**

```bash
git clone https://github.com/kubernetism/goodgood-store.git
cd goodgood-store
npm install
```

**2. Create your settings file**

```bash
cp .env.example .env.local
```

Open `.env.local` and fill it in using the table below. For local work, you only need `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Set `MEDIA_STORAGE=local` to keep uploaded images on your computer.

| Setting | What it is |
|---|---|
| `DATABASE_URL` | Neon's pooled connection URL |
| `DATABASE_URL_UNPOOLED` | Neon's direct connection URL, used for database updates |
| `AUTH_SECRET` | A random secret of at least 32 characters. Create one with `openssl rand -base64 48` |
| `ADMIN_EMAIL` | The email you will sign in with |
| `ADMIN_PASSWORD` | Your admin password, at least 12 characters |
| `MEDIA_STORAGE` | `neon` for live sites, or `local` for development only |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET` | Your Neon Object Storage bucket details |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Your Neon Object Storage access keys |

> **Never commit `.env.local` or share its contents.** Git is already set to ignore it.

**3. Set up the database and your admin account**

```bash
npm run db:migrate      # creates the database tables
npm run db:seed-admin   # creates your admin account
```

Only the password's hash is stored, so you can remove `ADMIN_PASSWORD` from `.env.local` afterwards.

**4. Add sample content (optional)**

```bash
npm run db:seed               # 7 categories and 26 sample products
npm run db:seed-blog          # sample blog posts
npm run db:seed-testimonials  # placeholder testimonials
npm run db:seed-team          # team members
```

These don't overwrite anything already saved, but they can bring back sample content you deleted. Sample products start with a placeholder stock of 25.

**5. Start the app**

```bash
npm run dev
```

- Store: <http://localhost:3000>
- Admin Portal: <http://localhost:3000/admin/login>

## Deploy to production

These steps use Vercel and Neon. Vercel's free Hobby plan is for non-commercial use, so check which plan a live store needs.

### 1. Create the database and image storage

1. In [Neon](https://neon.tech), create a project and copy the **pooled** and **direct** connection URLs.
2. Create an Object Storage bucket with **public read** access, because the store's images load directly from it.
3. Copy the bucket's endpoint, region, name and access keys.

### 2. Prepare the production database

Do this **before the first deploy**, because the build reads products from the database. Your computer normally uses the database in `.env.local`, so name the production database in the command:

```bash
DATABASE_URL="<pooled URL>" DATABASE_URL_UNPOOLED="<direct URL>" npm run db:migrate
```

Next, put the live `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` and create the account:

```bash
DATABASE_URL="<pooled URL>" npm run db:seed-admin
```

Set both URLs on `db:migrate`. If you only set `DATABASE_URL`, the command uses `DATABASE_URL_UNPOOLED` from `.env.local` and updates the wrong database.

To start with a clean store, skip the sample content and add your own categories and products in the Admin Portal.

### 3. Deploy on Vercel

1. In [Vercel](https://vercel.com/new), import this GitHub repository. Keep the detected Next.js settings, as the build runs through `npm run build`.
2. Under **Environment Variables**, add `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`, `MEDIA_STORAGE=neon` and all five `S3_*` values. `ADMIN_EMAIL` and `ADMIN_PASSWORD` aren't needed here.
3. Click **Deploy**.

### 4. Connect your domain

1. In Vercel, go to **Settings → Domains**, add `www.abdulsamienterprises.com`, and copy the DNS records it shows into your domain provider.
2. Wait for the domain to show as active. Share images and page links use this address, set as `url` in `src/lib/site.ts`. If you use a different domain, change it there too.

### 5. Check the live site

1. Sign in at `/admin/login`, upload a test image and place a test order.
2. Paste a product link into [opengraph.xyz](https://www.opengraph.xyz) to check its share image.
3. Paste a link that has never been shared into WhatsApp. WhatsApp keeps old previews, so links shared earlier may not update.

### Releasing updates

Pushing to `main` deploys automatically once the repository is connected to Vercel. **Database changes aren't applied automatically.** If an update adds files in `drizzle/`, run the `db:migrate` command from step 2 before pushing.

## Add a product

Every product needs a category, so check **Admin → Categories** first.

[![Products in the Admin Portal](screenshots/readme/admin-products-thumb.jpg)](screenshots/readme/admin-products.jpg)

**1. Prepare your photos**

- Use JPEG, PNG, WebP or AVIF, up to **4 MB** each.
- Use a clear, well-lit photo with the product in the centre, because the share image crops it.
- You can add up to 20 images per product. Each one needs a short description, such as "Sidr honey 500 g jar on a wooden table".

**2. Open the form**

Sign in and go to **Admin → Products → Add product**.

**3. Fill in the details**

All fields are required unless marked optional.

| Section | Field | What to enter |
|---|---|---|
| Basics | Name | The name customers see, such as `Sidr (Beri) Honey` |
| | Slug | The web address, such as `sidr-honey-500g`. Use lowercase letters, numbers and dashes only |
| | Category | Where the product belongs |
| | Show on the website | Leave off to save it as a hidden draft |
| Price and stock | Price | The selling price in rupees. Enter `4500` for Rs 4,500 |
| | Compare-at price (optional) | The old price, shown crossed out. It must be higher than the price, and it's what shows the product as on sale |
| | Stock quantity | How many you really have available |
| | Listed on | The date the product was added |
| Images | Gallery | Upload or choose images. **The first image is the main photo** and also appears on the share image |
| Honey details | Unit or pack size | Such as `500 g jar` |
| | Origin, Harvest | Where and when it was collected |
| | Floral source, Taste notes | Such as `Sidr blossom` and `Rich, caramel, slightly floral` |
| Description | Short summary | One or two sentences, used on product cards and the share image |
| | Description | The full product story |
| Tags (optional) | Raw, Organic, Best Seller and others | These power the shop's tag filters |
| Display and ratings | Display order | Lower numbers appear first in the shop |
| | Rating, Review count | **Enter only real customer ratings.** Use `0` if you have none yet |

**4. Save and check it**

1. Click **Save product**.
2. Open `/shop/your-slug` to see the product page.
3. Open `/shop/your-slug/card.jpg` to see its share image.

> Check your spelling before saving. The name and summary appear on the share image, and WhatsApp may keep showing an old version of a link that was already shared.

## Manage products

| To do this | Do this |
|---|---|
| Change a price or stock | Open the product, change it and save |
| Start a sale | Set **Price** to the sale price and **Compare-at price** to the old price |
| End a sale | Set the price back and clear **Compare-at price** |
| Hide a product | Turn off its website switch in the product list. This saves immediately |
| Remove a product but keep its record | Use **Archive this product**. You can restore it later |
| Delete a product permanently | Use **Delete this product**. Past orders keep their details, but cancelling one can no longer restore this product's stock |
| Show a product as sold out | Set its stock to `0` |

Good to know:

- **Changing a slug breaks old links** to that product, including links already shared.
- **Hiding a category hides all of its products.** A category only appears in the Shop menu when it has an active product.
- **Stock:** cancelling an order returns its items to stock. The dashboard warns you when an active product has 5 or fewer left.
- **Delivery charges** are set in code, in `src/features/cart/pricing.ts`: Rs 250, or free on orders of Rs 5,000 and over.

Orders, messages, newsletter and privacy duties are covered in [ADMIN_SETUP.md](ADMIN_SETUP.md).

## Go-live checklist

- [ ] Domain is connected and opens over `https`
- [ ] Sample products removed, and real stock counts entered
- [ ] Placeholder testimonials replaced with real customer feedback
- [ ] Test orders, test banners and test images removed
- [ ] Contact details checked in `src/lib/site.ts`
- [ ] WhatsApp number and social links set in **Admin → Settings**
- [ ] Strong admin password set, and removed from `.env.local`
- [ ] Share image checked in WhatsApp using a product link
- [ ] Neon plan limits checked for database and image storage

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the app for development |
| `npm run build` | Creates the production build |
| `npm start` | Runs the production build |
| `npm run lint` | Checks code style |
| `npm run typecheck` | Checks TypeScript types |
| `npm test` | Runs the tests |
| `npm run db:generate` | Creates a database update after a schema change |
| `npm run db:migrate` | Applies database updates |
| `npm run db:seed-admin` | Creates the admin account or resets its password |
| `npm run db:studio` | Opens a visual database browser |

## Troubleshooting

| Problem | What to do |
|---|---|
| `Invalid server environment` | A required setting is missing or too short. The message names it. Check `.env.local` or Vercel's Environment Variables |
| `Image storage is not configured` | Set `MEDIA_STORAGE=neon` and all `S3_*` values, or `MEDIA_STORAGE=local` in development |
| Uploaded images don't show on the live site | Check that the bucket has public read access, then redeploy. `S3_ENDPOINT` and `S3_BUCKET` are read during the build |
| Build fails while reading from the database | Run `db:migrate` on the production database, and check `DATABASE_URL` in Vercel |
| No image on a link in WhatsApp | Check the link on [opengraph.xyz](https://www.opengraph.xyz) and confirm the domain is live. For a link already shared, test with `?v=2` added to the end |
| Forgot the admin password | Set a new `ADMIN_PASSWORD` and run `npm run db:seed-admin`. This also signs out existing sessions |
| Locked out of sign-in | Too many failed attempts block sign-in for 15 minutes. Wait, then try again |
| Product doesn't appear in the shop | Check that its website switch is on and its category isn't hidden |
