This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment variables

Copy `.env.example` to `.env.local` and fill in values:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox map on the homepage |
| `MONGODB_URI` | MongoDB connection string (same DB as before) |
| `MONGODB_DB` | Database name (default: `thambalagama_estate`) |
| `PAYLOAD_SECRET` | Long random string for Payload CMS |
| `RESEND_API_KEY` | Resend API key for booking notification emails |
| `EMAIL_FROM` | Sender on your verified Resend domain |
| `OWNER_EMAIL` | Inbox that receives new booking notifications |
| `NEXT_PUBLIC_SITE_URL` | Public site URL used in owner emails |

### Payload CMS (inquiries + gallery)

- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- On first visit, create your Payload admin user (email + password).
- **Inquiries** collection manages booking requests (status updates block calendar dates when set to Confirmed).
- **Gallery Images** collection manages extra `/gallery` photos (files stored under `media/gallery`).

If you still have legacy Binary images in `gallery_images`, migrate once:

```bash
npm run migrate:gallery
```

Then manage new uploads in Payload.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
