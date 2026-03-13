const express = require('express');
const { db } = require('../database');
const { authenticate, requireRole } = require('../auth');

const router = express.Router();

// GET /api/matches?league_id=X - Public: list matches
router.get('/', (req, res) => {
  const { league_id } = req.query;
  if (!league_id) return res.status(400).json({ error: 'league_id required' });

  const matches = db.prepare(`
    SELECT m.*,
      ht.name as home_team_name,
      at.name as away_team_name
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    WHERE m.league_id = ?
    ORDER BY m.matchday, m.match_date
  `).all(league_id);
  res.json(matches);
});

// POST /api/matches/generate - Super Admin: generate fixtures for a league
router.post('/generate', authenticate, requireRole('super_admin'), (req, res) => {
  const { league_id } = req.body;
  if (!league_id) return res.status(400).json({ error: 'league_id required' });

  const teams = db.prepare('SELECT * FROM teams WHERE league_id = ? ORDER BY name').all(league_id);
  if (teams.length < 2) return res.status(400).json({ error: 'Need at least 2 teams' });

  // Clear existing matches
  db.prepare('DELETE FROM matches WHERE league_id = ?').run(league_id);

  // Round-robin schedule generation
  const teamIds = teams.map(t => t.id);
  const n = teamIds.length;
  const usesBye = n % 2 !== 0;
  const list = [...teamIds];
  if (usesBye) list.push(null); // bye team
  const totalRounds = list.length - 1;
  const halfSize = list.length / 2;

  const insert = db.prepare(
    'INSERT INTO matches (league_id, home_team_id, away_team_id, matchday) VALUES (?, ?, ?, ?)'
  );

  const generateAll = db.transaction(() => {
    for (let round = 0; round < totalRounds; round++) {
      for (let i = 0; i < halfSize; i++) {
        const home = list[i];
        const away = list[list.length - 1 - i];
        if (home !== null && away !== null) {
          insert.run(league_id, home, away, round + 1);
        }
      }
      // Rotate: fix first element, rotate the rest
      list.splice(1, 0, list.pop());
    }
  });

  generateAll();

  const matches = db.prepare(`
    SELECT m.*, ht.name as home_team_name, at.name as away_team_name
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    WHERE m.league_id = ?
    ORDER BY m.matchday
  `).all(league_id);

  res.status(201).json(matches);
});

// PUT /api/matches/:id/score - Team Admin or Super Admin: update score
router.put('/:id/score', authenticate, (req, res) => {
  const { home_score, away_score } = req.body;
  if (home_score == null || away_score == null) {
    return res.status(400).json({ error: 'home_score and away_score required' });
  }
  if (home_score < 0 || away_score < 0) {
    return res.status(400).json({ error: 'Scores cannot be negative' });
  }

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  // Team admins can only update matches involving their team
  if (req.user.role === 'team_admin') {
    if (match.home_team_id !== req.user.team_id && match.away_team_id !== req.user.team_id) {
      return res.status(403).json({ error: 'You can only update scores for your own team matches' });
    }
  }

  db.prepare('UPDATE matches SET home_score = ?, away_score = ?, played = 1 WHERE id = ?')
    .run(home_score, away_score, match.id);

  res.json({ success: true });
});

// GET /api/standings?league_id=X - Public: compute standings
router.get('/standings', (req, res) => {
  // Note: this is mounted at /api/matches/standings but accessed as /api/standings
  // Actually let's handle it here
  res.status(404).json({ error: 'Use /api/standings instead' });
});

module.exports = router;
