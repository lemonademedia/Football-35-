# Football-35-

Een app voor het bijhouden van standen en voetbalcompetities die niet gelieerd zijn aan de KNVB.

## 35+ Football League Management System

A full-stack web app for managing non-KNVB 35+ football leagues. Built with React + Vite + Tailwind CSS (frontend) and Express + SQLite (backend).

### Features

- **Public view:** League standings, match results, and upcoming fixtures — no login required
- **Super Admin:** Create leagues, add teams, assign team admins, generate round-robin fixtures
- **Team Admin:** Enter/edit scores for own team's matches
- **Auto-ranking:** Points (3W/1D/0L), goal difference, goals scored
- **Mobile-first:** Responsive Tailwind CSS design

### Quick Start

```bash
# Install all dependencies
npm run install:all

# Run both server and client in development
npm run dev
```

- Frontend: http://localhost:5173
- API server: http://localhost:3001

### Default Super Admin

- Username: `admin`
- Password: `admin123`

### Database Schema

| Table    | Purpose                                     |
|----------|---------------------------------------------|
| users    | Admin accounts (super_admin, team_admin)    |
| leagues  | Leagues with name and season                |
| teams    | Teams belonging to a league                 |
| matches  | Fixtures with scores and matchday           |

### API Endpoints

| Method | Endpoint                  | Auth         | Description                    |
|--------|---------------------------|--------------|--------------------------------|
| POST   | /api/auth/login           | -            | Login                          |
| GET    | /api/auth/me              | Token        | Current user info              |
| GET    | /api/leagues              | -            | List leagues                   |
| POST   | /api/leagues              | Super Admin  | Create league                  |
| GET    | /api/teams?league_id=X    | -            | List teams in league           |
| POST   | /api/teams                | Super Admin  | Add team to league             |
| POST   | /api/teams/:id/admin      | Super Admin  | Assign team admin              |
| GET    | /api/matches?league_id=X  | -            | List matches                   |
| POST   | /api/matches/generate     | Super Admin  | Generate round-robin fixtures  |
| PUT    | /api/matches/:id/score    | Admin        | Update match score             |
| GET    | /api/standings?league_id=X| -            | Computed league standings      |

### Tech Stack

- **Frontend:** React 19, React Router, Tailwind CSS 4, Vite
- **Backend:** Express.js, better-sqlite3, bcryptjs, jsonwebtoken
