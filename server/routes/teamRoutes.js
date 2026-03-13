const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../database');
const { authenticate, requireRole } = require('../auth');

const router = express.Router();

// GET /api/teams?league_id=X - Public: list teams in a league
router.get('/', (req, res) => {
  const { league_id } = req.query;
  if (!league_id) return res.status(400).json({ error: 'league_id required' });
  const teams = db.prepare('SELECT * FROM teams WHERE league_id = ? ORDER BY name').all(league_id);
  res.json(teams);
});

// POST /api/teams - Super Admin: add team to league
router.post('/', authenticate, requireRole('super_admin'), (req, res) => {
  const { name, league_id } = req.body;
  if (!name || !league_id) return res.status(400).json({ error: 'Name and league_id required' });

  const league = db.prepare('SELECT id FROM leagues WHERE id = ?').get(league_id);
  if (!league) return res.status(404).json({ error: 'League not found' });

  const result = db.prepare('INSERT INTO teams (name, league_id) VALUES (?, ?)').run(name, league_id);
  res.status(201).json({ id: result.lastInsertRowid, name, league_id });
});

// POST /api/teams/:id/admin - Super Admin: assign team admin
router.post('/:id/admin', authenticate, requireRole('super_admin'), (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(409).json({ error: 'Username already exists' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, password, role, team_id) VALUES (?, ?, ?, ?)'
  ).run(username, hash, 'team_admin', team.id);

  res.status(201).json({ id: result.lastInsertRowid, username, role: 'team_admin', team_id: team.id });
});

// DELETE /api/teams/:id - Super Admin
router.delete('/:id', authenticate, requireRole('super_admin'), (req, res) => {
  db.prepare('DELETE FROM teams WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
