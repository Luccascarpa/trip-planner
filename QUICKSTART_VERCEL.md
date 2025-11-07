# 🚀 Quick Start: Deploy to Vercel in 5 Minutes

## ✅ Prerequisites (Already Done!)
- ✅ Code pushed to GitHub: `https://github.com/Luccascarpa/trip-planner`
- ✅ Vercel config ready (`vercel.json`)

## 🎯 5-Step Deployment

### Step 1: Run Database Migration (2 minutes)
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Open file: `supabase/migrations/20250106000000_create_scrapbook_schema.sql`
4. Copy all SQL → Paste → **Run**
5. ✅ Verify: You should see success message

### Step 2: Get Environment Variables (1 minute)
In Supabase Dashboard → **Settings** → **API**, copy:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public key** → `VITE_SUPABASE_ANON_KEY`

Your Google Maps API key → `VITE_GOOGLE_MAPS_API_KEY`

### Step 3: Deploy to Vercel (2 minutes)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import: `Luccascarpa/trip-planner`
4. Paste your 3 environment variables
5. Click **Deploy**
6. ✅ Wait ~2 minutes for build

### Step 4: Configure URLs (30 seconds)
**Supabase:** Dashboard → **Authentication** → **URL Configuration**
- Add your Vercel URL (e.g., `https://trip-planner-xxx.vercel.app`)

**Google Cloud:** Console → **Credentials**
- Add Vercel URL to API key restrictions

### Step 5: Test! (30 seconds)
Visit your Vercel URL and test:
- ✅ Sign up/Login
- ✅ Create a trip
- ✅ Open scrapbook

## 🎉 Done!

Your app is live at: `https://your-app.vercel.app`

---

## Need Help?

**Database migration failed?**
→ Check Supabase logs, ensure you're using the correct project

**Environment variables not working?**
→ They must start with `VITE_` prefix
→ Redeploy after adding them

**More help:**
→ See `DEPLOYMENT.md` for detailed guide
→ See `VERCEL_DEPLOYMENT_STEPS.md` for troubleshooting

---

**Pro Tip:** Star the repo on GitHub and enable auto-deployments for continuous updates!
