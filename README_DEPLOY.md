# 🚀 Deployment Guide: Algo8.ai Intern Management System

Follow these steps to take your application live on Vercel.

## Step 1: Set up a Cloud Database
1.  Go to [Supabase](https://supabase.com/) (Free) or [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres).
2.  Create a new project and copy your **Postgres Connection String** (Universal/URI format).
    - It should look like: `postgres://user:password@host:5432/dbname`

## Step 2: Migrate Your Data
1.  Open your terminal in the project folder.
2.  Run the migration script:
    ```bash
    python migrate_to_postgres.py
    ```
3.  Paste your **Cloud Postgres URL** when prompted. 
4.  This will transfer all your local interns (Kumar, Virat, etc.) to the cloud.

## Step 3: Deploy to Vercel
1.  Push your code to **GitHub**.
2.  Connect your GitHub repo to **Vercel**.
3.  In Vercel **Environment Variables**, add the following:
    - `DATABASE_URL`: (Your Postgres URL)
    - `GEMINI_API_KEY`: (Your AI key from `.env`)
    - `SECRET_KEY`: (Any random string)
    - `REGISTRATION_KEY`: `ALGO8_2025`
    - `VITE_API_URL`: `/api` (for the frontend)
4.  Click **Deploy**.

## Step 4: Verification
- Once deployed, visit your Vercel URL.
- Log in with your same HR/Manager credentials.
- All your data should be there!
