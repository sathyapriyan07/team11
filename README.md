<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# XI Arena

Cricket playing XI builder built with React, Vite, and Supabase.

## Run locally

**Prerequisites:** Node.js and Bun

1. Install dependencies:
   `bun install`
2. Copy `.env.example` to `.env.local` and set your keys.
3. Run the app:
   `npm run dev`

## Supabase setup

1. Create a Supabase project and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. Never put a service-role key in the browser app.
2. Open `/admin`, choose **Supabase PostgreSQL Schema**, copy the SQL, and run it in the Supabase SQL Editor. It creates the shared catalog table, the `player-images` bucket, and row-level security policies.
3. Create an admin user in Supabase Auth and set its **app metadata** to `{"role":"admin"}`. Only that claim enables shared catalog edits and image uploads. Do not use user-editable metadata for this role.
4. Sign in from the admin panel. If there is no shared catalog yet, the current browser's player, competition, team, and squad catalog is published. If a cloud catalog already exists, it is loaded instead.

The app starts with an empty catalog; no cricket records are bundled as seed data. Previously saved browser or Supabase data is preserved. The admin panel's **Clear All App Data** action clears this browser's app data and replaces the shared Supabase catalog with an empty catalog.

Player creation and editing use dedicated admin pages, linked from the player registry.

Admins can create and edit teams and competitions from their respective catalog tabs. Updates preserve each record's stable ID, retain previously listed competition seasons, and check team codes or competition names for duplicates.

The admin panel's **Bulk Data Importer** includes a Wikipedia import workflow for players, team squads, teams, competitions, and player career statistics. Squad imports extract linked player names from squad or roster tables, let admins review/select players, assign an existing team, and set a default or individual nationality before saving. Imports are previewed for review; statistics are matched from Wikipedia career tables and only selected formats with extracted values are merged into existing player records.

The shared catalog is publicly readable and editable only by authorized admins. Uploaded player images are publicly viewable; uploads are admin-only and limited to 5 MB JPEG, PNG, WebP, or GIF files. Custom pools, saved playing XIs, likes, and bookmarks remain in browser storage because they are user-specific and this setup does not add end-user accounts. If Supabase variables are absent, the app continues to use browser storage.

# team11
