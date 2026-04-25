# Divine Insure 🛡️

A modern, premium insurance company website prototype built with **React**, **Vite**, **Tailwind CSS v4**, and **Convex** for real-time backend functionality.

![Divine Insure](./public/hero-bg.png)

---

## ✨ Features

- **Landing Page** — Cinematic hero section, services overview, and call-to-action
- **About Page** — Company story, stats, core values grid, leadership team, and CTA
- **Get a Quote / Contact** — Full inquiry form connected to Convex real-time database
- **Admin Portal** — Password-protected staff portal with live chat (Convex powered)
- **Responsive Design** — Mobile-first layout across all pages
- **Glassmorphism Navbar** — Sticky, blurred white navbar with gold & navy branding

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Backend / Realtime | [Convex](https://convex.dev) |
| Icons | Lucide React |
| Routing | React Router v6 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A free [Convex](https://convex.dev) account

### Installation

```bash
# Clone the repository
git clone https://github.com/Thollarkings/insurediv.git
cd insurediv

# Install dependencies
npm install

# Set up Convex (follow prompts to link your project)
npx convex dev
```

### Running Locally

In separate terminals:

```bash
# Terminal 1 — Convex backend
npx convex dev

# Terminal 2 — Vite dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Variables

Create a `.env.local` file at the project root:

```env
VITE_CONVEX_URL=your_convex_deployment_url_here
```

Your Convex URL is shown when you run `npx convex dev`.

---

## 📁 Project Structure

```
src/
├── components/
│   └── Navbar.jsx          # Sticky glassmorphism navbar
├── pages/
│   ├── Landing.jsx         # Home / hero page
│   ├── About.jsx           # About us page
│   ├── Contact.jsx         # Get a Quote / Contact form
│   └── Admin.jsx           # Staff admin portal
├── App.jsx
├── main.jsx
└── index.css               # Tailwind v4 + custom theme tokens

convex/
├── inquiries.ts            # Contact form submissions
└── messages.ts             # Live staff chat messages

public/
├── hero-bg.png             # Landing page hero background
└── about-bg.png            # About page hero background
```

---

## 📄 License

Licensed under the [Apache License 2.0](./LICENSE).

---

> Built by [Thollarkings](https://github.com/Thollarkings) · Divine Insure © 2026
