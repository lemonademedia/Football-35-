const express = require('express');
const { db } = require('../database');
const { authenticate, requireRole } = require('../auth');

const router = express.Router();

// GET /api/leagues - Public: list all leagues
router.get('/', (_req, res) => {
  const leagues = db.prepare('SELECT * FROM leagues ORDER BY created_at DESC').all();
  res.json(leagues);
});

// GET /api/leagues/:id - Public: get league details
router.get('/:id', (req, res) => {
  const league = db.prepare('SELECT * FROM leagues WHERE id = ?').get(req.params.id);
  if (!league) return res.status(404).json({ error: 'League not found' });
  res.json(league);
});

// POST /api/leagues - Super Admin: create league
router.post('/', authenticate, requireRole('super_admin'), (req, res) => {
  const { name, season } = req.body;
  if (!name || !season) return res.status(400).json({ error: 'Name and season required' });

  const result = db.prepare('INSERT INTO leagues (name, season) VALUES (?, ?)').run(name, season);
  res.status(201).json({ id: result.lastInsertRowid, name, season });
});

// DELETE /api/leagues/:id - Super Admin
router.delete('/:id', authenticate, requireRole('super_admin'), (req, res) => {
  db.prepare('DELETE FROM leagues WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
