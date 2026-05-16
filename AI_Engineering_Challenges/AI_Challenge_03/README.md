# Papaya Insurance Email Previewer

This is a **Next.js** application built for AI Engineering Challenge 03. It serves as a live previewer for the Papaya Insurance claims lifecycle email templates.

## Features

- **6 Responsive HTML Email Templates**: Hand-crafted templates covering the entire claim lifecycle (Submitted, Documents Received, Under Review, Approved, Rejected, Payment Sent).
- **Live Variable Interpolation**: A React-powered editor panel that allows you to instantly inject sample data into the email templates via `{{variable}}` placeholders.
- **Mobile & Desktop Views**: Interactive toggles to preview how the emails will render across different device widths.
- **Premium Aesthetics**: Built with a custom glassmorphism design system using Vanilla CSS and the `Outfit` font family.

## Tech Stack

- **Framework:** Next.js (App Router)
- **UI Library:** React.js
- **Styling:** Vanilla CSS (no Tailwind utility classes per requirements)
- **Font:** `next/font/google` (Outfit)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to use the previewer. 

The application logic is located in `app/page.js`. The raw HTML email templates are safely stored and served from the `public/templates/` directory.

## Deployment

The easiest way to deploy this application is to use the [Vercel Platform](https://vercel.com/new). Vercel provides zero-configuration deployment for Next.js applications.

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Click "Deploy" – Vercel will handle the entire build process (`npm run build`) automatically.
