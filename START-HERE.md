# Start the App

## Quick start

1. **Double‑click `start-dev.bat`** in this folder  
   **or** open a terminal here and run:
   ```bash
   npm run dev
   ```

2. Wait until you see:
   ```
   ➜  Local:   http://localhost:4173/
   ```

3. Open that URL in your browser (Chrome, Edge, etc.).

## If it still doesn’t work

**“Port already in use”**  
Another app is using that port. Either close it, or Vite may switch to a different port (e.g. 4174, 4175). Check the terminal for the actual URL.

**“Connection refused” / blank page**
- Ensure the terminal stays open (don’t close it while you’re using the app).
- Try `http://127.0.0.1:4173` instead of `localhost`.
- Try a different browser.
- Disable browser extensions that might interfere.

**First time?** Run `npm install` in this folder before `npm run dev`.
