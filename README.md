# SwiftVote

SwiftVote is a modern, real-time polling application built with Next.js 15 and Supabase. It allows users to create polls, vote instantly, and see results update in real-time across all connected clients.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database%20&%20Auth-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

## 🚀 Features

- **Real-time Updates**: Watch poll results update instantly as votes come in using Supabase Realtime.
- **Secure Voting**: Built-in authentication and Row Level Security (RLS) policies to ensure data integrity.
- **Responsive Design**: Beautifully crafted UI with Tailwind CSS that works seamlessly on desktop and mobile.
- **Interactive Charts**: Visualize poll results with dynamic charts using Recharts.
- **User Dashboard**: Manage your polls and view voting history.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/michailtjhang/SwiftVote.git
   cd SwiftVote
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup

1. Create a `.env.local` file in the root directory.
2. Add your Supabase credentials (see [Supabase Setup](#supabase-setup) below):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### Supabase Setup

For detailed instructions, refer to [SETUP.md](./SETUP.md).

1. Create a new project on Supabase.
2. Run the SQL schema provided in `supabase/schema.sql` in the Supabase SQL Editor to set up tables and policies.
3. Retrieve your Project URL and Anon Key from Project Settings > API.

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable React components.
- `lib/`: Utility functions and Supabase client configuration.
- `supabase/`: SQL schemas and database configuration.
- `public/`: Static assets.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
