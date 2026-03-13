import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';

export default function TeamDashboard() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [scores, setScores] = useState({});
  const [msg, setMsg] = useState('');

  const loadMatches = useCallback(async () => {
    if (!user?.team_id) return;
    // Find team's league
    const leagues = await api.getLeagues();
    for (const league of leagues) {
      const allMatches = await api.getMatches(league.id);
      const myMatches = allMatches.filter(
        m => m.home_team_id === user.team_id || m.away_team_id === user.team_id
      );
      if (myMatches.length > 0) {
        setMatches(myMatches);
        const team = myMatches[0].home_team_id === user.team_id
          ? myMatches[0].home_team_name
          : myMatches[0].away_team_name;
        setTeamName(team);
        break;
      }
    }
  }, [user]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handleScoreChange = (matchId, field, value) => {
    setScores(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: value }
    }));
  };

  const handleSubmit = async (match) => {
    const s = scores[match.id];
    if (!s || s.home == null || s.away == null) {
      flash('Enter both scores');
      return;
    }
    try {
      await api.updateScore(match.id, parseInt(s.home), parseInt(s.away));
      flash('Score updated!');
      loadMatches();
    } catch (err) {
      flash(err.message);
    }
  };

  if (!user || user.role !== 'team_admin') {
    return <div className="text-center py-16 text-gray-400">Access denied</div>;
  }

  const unplayed = matches.filter(m => !m.played);
  const played = matches.filter(m => m.played);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Team Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Managing: {teamName}</p>

      {msg && <div className="bg-green-50 text-green-800 border border-green-200 rounded-lg p-3 mb-4 text-sm">{msg}</div>}

      {/* Enter scores */}
      <h2 className="text-lg font-semibold mb-3">Enter Match Results</h2>
      {unplayed.length === 0 ? (
        <p className="text-gray-400 text-sm mb-6">All matches have scores entered.</p>
      ) : (
        <div className="space-y-3 mb-8">
          {unplayed.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-2">Matchday {m.matchday}</div>
              <div className="flex items-center gap-2">
                <span className="flex-1 text-right text-sm font-medium">{m.home_team_name}</span>
                <input
                  type="number" min="0" placeholder="-"
                  value={scores[m.id]?.home ?? ''}
                  onChange={e => handleScoreChange(m.id, 'home', e.target.value)}
                  className="w-14 text-center border border-gray-300 rounded-lg py-1 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
                <span className="text-gray-400">:</span>
                <input
                  type="number" min="0" placeholder="-"
                  value={scores[m.id]?.away ?? ''}
                  onChange={e => handleScoreChange(m.id, 'away', e.target.value)}
                  className="w-14 text-center border border-gray-300 rounded-lg py-1 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
                <span className="flex-1 text-left text-sm font-medium">{m.away_team_name}</span>
                <button
                  onClick={() => handleSubmit(m)}
                  className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past results */}
      <h2 className="text-lg font-semibold mb-3">Past Results</h2>
      {played.length === 0 ? (
        <p className="text-gray-400 text-sm">No results yet.</p>
      ) : (
        <div className="space-y-2">
          {played.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between text-sm">
              <span className="font-medium text-right flex-1">{m.home_team_name}</span>
              <span className="mx-3 font-bold text-green-800 bg-green-50 px-3 py-1 rounded">
                {m.home_score} - {m.away_score}
              </span>
              <span className="font-medium text-left flex-1">{m.away_team_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
