# Dashboard - Content Management System

A modern Next.js dashboard for managing your mobile app's content, files, and configuration.

## Features

- **Content Management**: Create and edit dynamic content for your app
- **File Manager**: Upload and manage images, documents, and other assets
- **App Configuration**: Manage app settings and preferences
- **Authentication**: Secure login with Supabase Auth

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

### First Time Setup

1. Create a user account in Supabase Dashboard > Authentication
2. Or use the sign-up flow (if implemented)
3. Log in to the dashboard
4. Start creating content for your app

### Managing Content

1. Go to **Content Management**
2. Click **+ Add Content**
3. Fill in:
   - **Page**: The page identifier (e.g., "home", "about")
   - **Section**: Section within the page (e.g., "hero", "features")
   - **Title**: Content title
   - **Description**: Content description
   - **Image URL**: Optional image URL

### Managing Files

1. Go to **File Manager**
2. Click **+ Upload File**
3. Select a file to upload
4. Files are automatically stored in Supabase Storage
5. Use the file URL in your content

### App Configuration

1. Go to **App Configuration**
2. Add key-value pairs for app settings
3. Values are stored as JSON
4. Access from your mobile app via Supabase

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- Supabase (Database & Storage)
