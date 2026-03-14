# Supabase Setup Guide

## 1. Create a Project
Go to [Supabase](https://supabase.com/) and create a new project.

## 2. Database Schema
1. Go to the **SQL Editor** in your Supabase dashboard.
2. Open the `schema.sql` file from this repository.
3. Copy the content and paste it into the SQL Editor.
4. Click **Run**.

This will create all the necessary tables (profiles, posts, comments, likes, series) and set up Row Level Security (RLS) policies.

## 3. Environment Variables
1. Copy `.env.local.example` to `.env.local`.
2. Go to **Project Settings > API** in Supabase.
3. Copy the `Project URL` to `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the `anon public` key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 4. Auth Configuration
1. Go to **Authentication > Providers**.
2. Enable **Email** provider.
3. (Optional) Configure SMTP settings for production email delivery.

## 5. Storage (Optional)
If you plan to use Supabase Storage for images (instead of external URLs), create a bucket named `images` and set policies. However, the current PRD specifies using external image hosting (e.g., s.ee), so this is not strictly required.
