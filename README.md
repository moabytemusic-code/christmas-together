# 🎄 Christmas Together

> **A Private, Secure, Festive Secret Santa Web Application for Families**

Christmas Together is a complete, self-hosted Secret Santa web application designed specifically for families to organize annual Christmas gift exchanges with joy, privacy, and simplicity.

---

## ✨ Features

- **Fair & Smart Random Drawing Engine:**
  - Guarantees 1:1 derangement: every participant gives one gift and receives one gift.
  - No self-assignments.
  - Spouse and partner exclusion rules are strictly enforced.
  - Detects impossible rule configurations and explains conflicts before drawing.
  - Committed in an atomic database transaction.
  - Concurrency protected to prevent duplicate drawings or accidental redraws.

- **Strict Assignment Privacy:**
  - Participants can only view their own assigned recipient.
  - Even family administrators cannot view secret pairings, keeping the magic alive for the organizer!
  - Protected by server-side authorization and encrypted sessions.

- **Holiday Wish Lists & Private Checklist:**
  - Share favorite colors, clothing/shoe sizes, hobbies, and gift ideas with product links.
  - Private gift tracking checklist for the giver (*Planning &rarr; Shopping &rarr; Purchased &rarr; Wrapped &rarr; Completed*).

- **Memorable Gift Reveal Experience:**
  - Interactive festive gift box with unwrap animation.
  - Optional holiday chime fanfare (crystal bells via Web Audio API).
  - Confetti burst celebration with KaTeX/reduced-motion accessibility options.

- **Integrated Christmas Music Player:**
  - Built-in public-domain instrumental Christmas carols synthesized on-demand with zero asset delay.
  - Administrator upload support for custom MP3, OGG, and WAV tracks.
  - Persistent volume storage and playback controls (volume, skip, mute, master toggle).
  - Optional and disabled by default (never forces audio on users).

- **Brevo Transactional Email Integration:**
  - Notifies participants when Secret Santa names are drawn.
  - **Zero Privacy Leakage:** Recipient names are **never** included in email notifications!
  - Graceful fallback if email is not configured (drawing is preserved and never rolled back).

- **Self-Hosted Docker Architecture:**
  - Production-ready Dockerfile (Next.js 15 standalone build, non-root user).
  - Docker Compose setup with dedicated PostgreSQL 16 Alpine container.
  - Automated backup script (`scripts/backup.sh`) with gzip integrity tests, checksums, and 30-day retention.
  - Automated restoration script (`scripts/restore.sh`).
  - Tailored Coolify deployment configuration (`docker-compose.coolify.yml`).

---

## 🛠️ Technology Stack

- **Frontend & Backend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Database & ORM:** PostgreSQL 16 (dedicated container), Prisma ORM with versioned migrations and transactions.
- **Authentication:** Custom secure JWT session cookies (`jose`), bcrypt password hashing (12 salt rounds), secure single-use tokens.
- **Storage:** Persistent Docker volumes for PostgreSQL data (`postgres_data`) and custom music uploads (`music_uploads`).
- **Email:** Brevo (Sendinblue) transactional REST API.
- **Deployment:** Docker & Coolify.

---

## 🚀 Quick Start (Local Docker Compose)

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd "secret santa"
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and adjust AUTH_SECRET or passwords if needed
   ```

3. **Start the application and database:**
   ```bash
   docker compose up -d --build
   ```

4. **Run migrations and seed the initial admin account:**
   ```bash
   docker compose exec app npx prisma migrate deploy
   docker compose exec app npm run prisma:seed
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).
   Log in with the default admin credentials:
   - **Email:** `admin@family.com`
   - **Password:** `ChristmasAdmin2026!` *(Change this immediately after login!)*

---

## 📦 Automated Backups & Disaster Recovery

### Creating a Verified Backup:
```bash
./scripts/backup.sh
```
Backups are compressed with gzip, checksummed with SHA-256, and verified for non-zero integrity in `./backups`.

### Restoring a Backup:
```bash
./scripts/restore.sh ./backups/christmas_together_20261019_120000.sql.gz
```

---

## 🧪 Running Automated Tests

Run the full Vitest suite (covers drawing engine, exclusion rules, password hashing, session tokens, and audio buffer verification):
```bash
npm run test
```

---

## 📄 Documentation

- [Coolify Deployment Guide](./COOLIFY.md)
- [Security Checklist & Privacy Architecture](./SECURITY.md)
- [Maintenance & Operations Guide](./MAINTENANCE.md)
