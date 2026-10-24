# FeedbackIQ: login and register update

Unzip this into the root of your repo (the folder that contains `backend/` and `frontend/`) and choose "replace" when asked.
Your `frontend/.env`, `frontend/vite.config.ts` and `backend/.env` are not included, so they stay as they are.

## Backend
```bash
cd backend && source .venv/bin/activate
pip install -r requirements.txt        # adds pyjwt, bcrypt, email-validator
```
Add these two lines to `backend/.env`:
```
JWT_SECRET=<long random value>
ACCESS_TOKEN_MINUTES=1440
```
Generate the secret with: `python -c "import secrets; print(secrets.token_hex(32))"`
```bash
alembic upgrade head                   # creates the users table
uvicorn app.main:app --reload
```

## Frontend
No new packages. Restart `npm run dev`, open the app, and you land on the sign-in page.

## What changed
- New: `backend/app/auth/` (users, password hashing, tokens, `/api/auth/register`, `/login`, `/me`), migration `0002_users.py`, `tests/test_security.py`
- Changed: `backend/app/main.py` (all `/api` routes except auth now need a token), `requirements.txt`, `.env.example`
- New: `frontend/src/pages/Login.tsx`, `Register.tsx`, `components/RequireAuth.tsx`, `AuthLayout.tsx`, `Field.tsx`, `context/AuthContext.tsx`, `api/auth.ts`
- Changed: `frontend/src/api/client.ts` (sends the token, signs out on 401), `App.tsx`, `main.tsx`, `components/Layout.tsx` (name and Sign out button)

## Notes
- With `VITE_USE_MOCK=true` the sign-in is simulated in the browser (any valid-looking email works). This is for demos only.
- The token is stored in the browser's localStorage. That is fine for a project; for production consider httpOnly cookies and HTTPS.
- Not included yet: password reset, email verification, rate limiting on login, roles. All signed-in users see the same shared feedback data.
