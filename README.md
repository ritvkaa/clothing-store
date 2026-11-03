# Clothing Store

A Next.js storefront with customer accounts, a protected admin panel, MongoDB-backed products and orders, Cloudinary image uploads, and Razorpay checkout.

## Run locally

Requirements: Node.js and a MongoDB database.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create `.env.local` in the project root and add the variables listed below. Never commit `.env.local` or paste its contents into public files.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string. Use Atlas for Vercel; a `127.0.0.1` or `localhost` URI only works on your own computer. |
| `ADMIN_LOGIN_SECRET` | Secret path segment for the admin login page. Keep it private. |
| `RAZORPAY_KEY_ID` | Razorpay key ID used by the server checkout flow. |
| `RAZORPAY_KEY_SECRET` | Razorpay server secret. Keep it private. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name, used by image upload features. |
| `CLOUDINARY_API_KEY` | Cloudinary API key used by the server upload endpoint. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret. Keep it private. |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset used by the client upload component. |

Add the required values in the Vercel project's **Settings → Environment Variables** for each environment you deploy. Server secrets must not use a `NEXT_PUBLIC_` prefix. The `NEXT_PUBLIC_` values are included in browser code and are public. After changing Vercel variables, create a new deployment for them to take effect.

For payment testing, use a matching Razorpay **Test Mode** key ID and secret. Test Mode simulates payments and does not charge customers. Switch to Live Mode keys only after the Razorpay account is approved and the live integration is ready.

## Customer and admin access

- Customers sign in at `/login`.
- Admins use a separate, secret login path: `/admin-access/<ADMIN_LOGIN_SECRET>`.
- Replace `<ADMIN_LOGIN_SECRET>` with the value of that environment variable. Do not type the angle brackets or share the resulting URL.
- After signing in, admins can open `/admin`. Requests to `/admin` without a valid admin session return to the storefront.
- Customer and admin sessions use separate cookies. Closing a tab does not itself log an account out; use the logout control to end the session.
- Admin accounts are stored in MongoDB. A new Atlas database must contain an admin record before that email and password can sign in. The secret URL only opens the admin login page; it does not create an admin account.

Set the same `ADMIN_LOGIN_SECRET` in local `.env.local` and in the Vercel environment used by the deployment. If the value is missing or does not match the URL, the admin login path returns 404.

## Database and deployment

MongoDB Compass is a client; it does not sync a local database to Atlas. For a deployed site, point `MONGODB_URI` to Atlas and migrate the needed collections from the local `clothing-store` database. Product and category documents, account data, orders, carts, and wishlists are database records, not seeded automatically by Vercel. If sessions are not migrated, users and admins need to sign in again.

Connect the GitHub repository to Vercel, add the environment variables to the project, and deploy. Use the domain shown by the active Vercel project; deployment-specific URLs can change between deployments.

To create a production build locally:

```bash
npm run build
```
