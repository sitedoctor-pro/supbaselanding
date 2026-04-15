# Supabase Store Dashboard (Static HTML)

## Files
- `index.html`: public store page
- `login.html`: login page for the owner
- `dashboard.html`: protected dashboard page
- `style.css`: all styles
- `supabase.js`: Supabase connection setup
- `app.js`: loads products into the store page
- `login.js`: handles sign in
- `dashboard.js`: add/edit/delete products
- `auth-policies.sql`: secure policies for authenticated dashboard use only
- `product-sample.svg`: local sample image

## Important setup
1. Upload these files to GitHub.
2. Run `auth-policies.sql` once in Supabase SQL Editor.
3. Use `login.html` to sign in.
4. After login, open `dashboard.html`.

## Notes
- Public visitors can view `index.html`.
- Only authenticated users can use the dashboard after applying `auth-policies.sql`.
- The dashboard supports remote image URLs or uploaded images.
