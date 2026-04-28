# Top Notch Insurance Brokers 🛡️

A modern, premium insurance company website prototype built with **React**, **Vite**, **Tailwind CSS v4**, and **Convex** for real-time backend functionality.

![Top Notch Insurance Brokers](./public/hero-bg.png)

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

### Test Credentials

A test admin account is available for development:

- **Email:** enrol@topnotchib.com

**Note:** Since Convex Password authentication requires users to create their own passwords, you'll need to sign up first by visiting `/admin` and entering this email with a new password. See [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md) for detailed instructions.

### Staff Enrollment

To create staff accounts for the admin portal, access the Staff Enrollment page directly:

1. Navigate directly to `/enroll` (not linked from the main site)
2. Enter the enrollment code: `diven45-2026`
3. Create staff accounts with name, email, and role (staff/admin)
4. Staff can then log in at `/admin` using their credentials

**Note:** The enrollment page is intentionally not linked from the main navigation and is only accessible via direct URL for security purposes.

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
│   ├── Admin.jsx           # Staff admin portal
│   └── Enroll.jsx          # Staff enrollment portal
├── App.jsx
├── main.jsx
└── index.css               # Tailwind v4 + custom theme tokens

convex/
├── auth.js                 # ConvexAuth configuration
├── schema.ts               # Database schema
├── staff.ts                # Staff management functions
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

> Built by [Thollarkings](https://github.com/Thollarkings) · Top Notch Insurance Brokers © 2026
