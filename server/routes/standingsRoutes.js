const express = require('express');
const { db } = require('../database');

const router = express.Router();

// GET /api/standings?league_id=X - Public: computed league standings
router.get('/', (req, res) => {
  const { league_id } = req.query;
  if (!league_id) return res.status(400).json({ error: 'league_id required' });

  const teams = db.prepare('SELECT * FROM teams WHERE league_id = ?').all(league_id);
  const matches = db.prepare('SELECT * FROM matches WHERE league_id = ? AND played = 1').all(league_id);

  const standings = {};
  for (const team of teams) {
    standings[team.id] = {
      team_id: team.id,
      team_name: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
    };
  }

  for (const match of matches) {
    const home = standings[match.home_team_id];
    const away = standings[match.away_team_id];
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.goals_for += match.home_score;
    home.goals_against += match.away_score;
    away.goals_for += match.away_score;
    away.goals_against += match.home_score;

    if (match.home_score > match.away_score) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (match.home_score < match.away_score) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }

  const sorted = Object.values(standings)
    .map(s => ({ ...s, goal_difference: s.goals_for - s.goals_against }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      return b.goals_for - a.goals_for;
    });

  res.json(sorted);
});

module.exports = router;
