# SwiftVote App Setup Guide

## 1. Supabase Setup

### Create Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter name (e.g., "SwiftVote"), database password, and region

### Run Database Schema
1. In your project dashboard, go to **SQL Editor** (icon on the left sidebar)
2. Click **New Query**
3. Copy the content from `supabase/schema.sql` in this project
4. Paste it into the SQL Editor
5. Click **Run**

This will create:
- `polls` table
- `poll_options` table
- `votes` table
- Security policies (RLS)
- Realtime configuration

### Get Credentials
1. Go to **Project Settings** (gear icon) -> **API**
2. Copy **Project URL** and **anon public key**
3. Create a `.env.local` file in the root of your project
4. Paste the credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## 2. Running local
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)

## 3. Features to Test
- **Sign Up**: Create a new account
- **Dashboard**: Check that you can see the dashboard
- **Create Poll**: Create a new poll with multiple options
- **Voting**: 
  - Open the poll in a new browser window (or incognito)
  - Log in with a different account (or create one)
  - Vote and see the chart update instantly in both windows!
