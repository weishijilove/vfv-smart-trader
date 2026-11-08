# VFV Smart Trader

A small iPhone-friendly PWA for monitoring Vanguard S&P 500 Index ETF (VFV.TO).

## Publish with GitHub Pages
1. Create a **public** repository named `vfv-smart-trader`.
2. Upload all files in this folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
5. Wait for the Pages URL, open it in Safari on iPhone, tap Share → Add to Home Screen.

## Important limitations
- The app reads daily historical data from Yahoo Finance's chart endpoint. It is not guaranteed real-time, and browser access to this endpoint may be blocked or change. If so, use a reputable market-data provider and a secure server-side proxy; do not put API secrets in public JavaScript.
- The app refreshes every 15 minutes while open. iOS does not guarantee background execution or scheduled notifications for a static web app.
- Notifications are local browser notifications while the page is active; they are not guaranteed push alerts.
- This app does not connect to Wealthsimple, place orders, or provide personalized financial/tax advice.
- The 5% and 8% pullback checks currently reference the 52-week high; 3-month high is shown separately.
