# Trip Planner - Deployment Guide

This guide will help you deploy the Trip Planner application to Vercel.

## Prerequisites

- Supabase account with project set up
- Google Maps API key
- GitHub account
- Vercel account

## Step 1: Run Database Migration

**CRITICAL:** Before deploying, you must run the scrapbook database migration.

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open `supabase/migrations/20250106000000_create_scrapbook_schema.sql`
4. Copy the entire SQL content
5. Paste into the SQL Editor
6. Click **Run**

This creates the following tables:
- `books` - Scrapbook books (one per trip)
- `sections` - Sections within books
- `pages` - Individual scrapbook pages
- `page_elements` - Draggable elements (images, text, stickers)

## Step 2: Environment Variables

You need three environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Get Supabase Credentials:
1. Go to Supabase Dashboard
2. Click on **Project Settings** (gear icon)
3. Go to **API** section
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Get Google Maps API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Maps JavaScript API**
4. Go to **Credentials**
5. Create API Key
6. Restrict the key to your domain (add Vercel URL when deployed)

## Step 3: Push to GitHub

The repository is already initialized and connected to:
```
git@github.com:Luccascarpa/trip-planner.git
```

To push your code:

```bash
git add .
git commit -m "Initial commit: Trip Planner with Scrapbook feature"
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository: `Luccascarpa/trip-planner`
4. Configure the project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variables:
   - Click **Environment Variables**
   - Add all three variables listed above
   - Make sure they're available for Production, Preview, and Development
6. Click **Deploy**

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

## Step 5: Post-Deployment Configuration

### 1. Update Google Maps API Key Restrictions
- Go to Google Cloud Console → Credentials
- Edit your API key
- Under **Application restrictions**, add your Vercel URL
- Example: `your-app.vercel.app`

### 2. Update Supabase Allowed URLs
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add your Vercel URL to **Site URL** and **Redirect URLs**
- Example: `https://your-app.vercel.app`

### 3. Verify Deployment
Test these features:
- ✅ User authentication (sign up, login)
- ✅ Create a trip
- ✅ Add places to map
- ✅ Create reservations
- ✅ **Scrapbook feature:**
  - Create sections
  - Add pages
  - Drag images, text, stickers
  - Double-click text to edit inline
  - Use fullscreen mode

## Troubleshooting

### Build Errors
If you see TypeScript errors during build:
1. Ensure the database migration has been run
2. The app will still build but may have warnings
3. Once migration runs, errors will resolve

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Redeploy after adding/changing variables
- Check Vercel deployment logs

### Supabase Connection Issues
- Verify `VITE_SUPABASE_URL` includes `https://`
- Check that RLS policies are enabled (migration does this)
- Verify anon key is correct

### Google Maps Not Loading
- Check API key is valid
- Verify Maps JavaScript API is enabled
- Check domain restrictions match your Vercel URL

## Features Included

### Core Features:
- 🗺️ Interactive map with custom markers
- 📍 Place management (add, edit, delete)
- 📅 Day-by-day trip planning
- 🍽️ Restaurant reservations tracking
- 👥 Trip sharing with collaborators

### Scrapbook Features (NEW):
- 📖 One scrapbook per trip
- 📂 Organize into sections (days/locations)
- 📄 Multiple pages per section
- 🖼️ Drag & drop images
- ✏️ Inline text editing (double-click)
- 🎨 Customizable backgrounds
- 📐 Resize & rotate elements
- 🎯 Sticker library
- 🖥️ Fullscreen editing mode

## Continuous Deployment

Once set up, Vercel will automatically deploy:
- **Production:** Every push to `main` branch
- **Preview:** Every push to other branches / pull requests

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Google Maps API restrictions
5. Update Supabase allowed URLs

## Support

For issues:
- Check Vercel deployment logs
- Review Supabase logs
- Check browser console for errors
- Refer to [Vercel Documentation](https://vercel.com/docs)
- Refer to [Supabase Documentation](https://supabase.com/docs)

---

**Repository:** https://github.com/Luccascarpa/trip-planner
**Deployment Date:** January 2025
