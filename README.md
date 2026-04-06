# Divine Emmanuel — Full-Stack Engineer Ecosystem

This workspace contains the complete technical ecosystem for Divine Emmanuel, organized into a professional monorepo-style structure.

## 📂 Project Structure

### �� Core Portfolio (`/`)
The primary landing page and visual identity.
- [index.html](index.html) - Main entry point.
- [assets/](assets/) - Images, styles, and static resources.
- [public/](public/) - Secondary experience pages (Deep Dives, Video Demos).

### 🛠 Applications (`/apps`)
Specialized technical tools built with modern frameworks.
- [apps/devquote-app/](apps/devquote-app/) - **Next.js 14** Project Estimator with real-time quote generation and PDF export.

### 🔑 Backend (`/server`)
Infrastructure and API services.
- [server/index.js](server/index.js) - Node.js/Express server handling Stripe payments and booking records.
- [server/data/](server/data/) - Local database for storing project requests.

## 🚀 Getting Started

1. **Portfolio**: Open `index.html` in any browser.
2. **Estimator App**: 
   ```bash
   cd apps/devquote-app
   npm run dev
   ```
3. **Backend**:
   ```bash
   cd server
   node index.js
   ```

---
© 2026 Divine Emmanuel. All rights reserved.
