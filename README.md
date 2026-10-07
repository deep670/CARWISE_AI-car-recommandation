# CARWISE — Premium MERN AI Car Platform

A premium dark automotive React/Vite interface backed by Node/Express + MongoDB. The design follows the approved CARWISE reference: cinematic hero, dark navy/black surfaces, cyan/blue accents, glass cards, compact feature tiles and premium vehicle photography.

## Product flow
- Guests see a concise homepage overview.
- Protected features redirect guests to `/login?redirect=...`.
- After authentication, the user gets the full catalogue, AI, comparison, EV, upcoming, reviews, news, wishlist and calculator tools.
- `Premium Garage` is available inside the authenticated dashboard.
- There is no admin panel or admin authorization.

## Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

## Backend
Create `backend/.env` from `.env.example`, then:
```bash
cd backend
npm install
npm run seed
npm run dev
```
Default API: `http://localhost:5000`.

## MongoDB
Local:
`mongodb://127.0.0.1:27017/carwise`

Atlas: set `MONGODB_URI` to your Atlas connection string.

## Authentication
Register or sign in from the frontend. JWT is stored client-side for this development build and attached to protected API calls.

## Hero asset
The approved white/black Bugatti hero is bundled in `frontend/public/images/carwise-hero-bugatti.png`.
