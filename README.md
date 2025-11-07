# Trip Planner

A full-stack trip planning application that combines journal and map functionality to help you plan and manage your travels.

## Features

✨ **Core Features:**
- 🗺️ **Interactive Map**: Google Maps integration with clickable markers for all your places
- 📝 **Journal View**: Organize places in a list format with detailed information
- ✅ **Check-in System**: Mark places as visited with a simple checkbox
- 📸 **Photo Upload**: Attach photos to visited places
- 🏷️ **Categories**: Organize places by type (restaurants, museums, shows, etc.)
- 📅 **Trip Management**: Create multiple trips with dates and descriptions
- 💾 **Cloud Storage**: All data synced with Supabase
- 🔐 **Authentication**: Secure user accounts with email/password

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Maps**: Google Maps (@vis.gl/react-google-maps)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Lucide React
- **Routing**: React Router v6

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the SQL script from `SUPABASE_SETUP.md`
3. Create a storage bucket named `place-photos` (Settings → Storage)
4. Copy your Supabase URL and anon key from Settings → API

### 3. Set Up Google Maps

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Places API (optional, for future features)
4. Create credentials (API Key)
5. Copy your API key

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage Guide

### Creating a Trip

1. Click "New Trip" on the dashboard
2. Enter trip name, description, and dates
3. Click "Create Trip"

### Adding Places

1. Open a trip
2. Click "Add Place"
3. Fill in the place details
4. Click on the map to set the location
5. Select a category
6. Click "Add Place"

### Managing Places

- **Check off visited places**: Click the checkbox next to any place
- **Add photos**: Click "Add Photo" on visited places
- **Edit place**: Click the edit icon
- **Delete place**: Click the trash icon
- **View details**: Click "Show more" to expand place information

### Map vs List View

Toggle between map and list views using the buttons in the top right:
- **Map View**: See all places on an interactive Google Map with a sidebar list
- **List View**: See all places in a detailed list format

## Database Schema

### Tables

- **trips**: Store trip information (name, dates, description)
- **trip_days**: Organize trips by days (future feature)
- **places**: Store place details (name, location, category, notes, reviews)
- **place_photos**: Store photo URLs for places
- **categories**: Predefined categories with colors

### Security

All tables have Row Level Security (RLS) enabled. Users can only access their own data.

## Project Structure

```
src/
├── components/          # React components
│   ├── Layout.tsx      # App layout with header
│   ├── MapView.tsx     # Google Maps component
│   ├── PlacesList.tsx  # List of places with checkboxes
│   └── PlaceModal.tsx  # Form for adding/editing places
├── hooks/              # Custom React hooks
│   ├── useTrips.ts     # Trip CRUD operations
│   ├── usePlaces.ts    # Place CRUD operations
│   └── useCategories.ts # Fetch categories
├── lib/                # Utilities and configs
│   ├── supabase.ts     # Supabase client
│   └── database.types.ts # TypeScript types
├── pages/              # Page components
│   ├── Auth.tsx        # Login/signup page
│   ├── Dashboard.tsx   # Trips list
│   └── TripDetail.tsx  # Trip detail with map/list
├── App.tsx             # Main app with routing
└── main.tsx           # App entry point
```

## Future Enhancements

- 📅 **Day-by-day planning**: Organize places by specific days
- 🔍 **Places search**: Search Google Places API
- 🗓️ **Itinerary export**: Export trip as PDF
- 🌐 **Trip sharing**: Share trips with friends
- 📱 **Mobile app**: React Native version
- 🎨 **Custom themes**: Personalize the interface
- 📊 **Trip statistics**: View trip analytics

## Troubleshooting

### Map not showing
- Verify your Google Maps API key is correct in `.env`
- Check that Maps JavaScript API is enabled in Google Cloud Console
- Make sure you're using a valid Map ID (automatically generated)

### Images not uploading
- Verify the `place-photos` storage bucket exists in Supabase
- Check storage policies are set correctly
- Ensure the bucket is set to public

### Database errors
- Run the SQL script from `SUPABASE_SETUP.md` completely
- Verify RLS policies are enabled
- Check your Supabase credentials in `.env`

## Contributing

Feel free to fork this project and make it your own! Some ideas:
- Add new place categories
- Implement social features
- Add weather integration
- Create mobile app version

## License

MIT License - feel free to use this project however you'd like!

---

Happy travels! 🌍✈️
