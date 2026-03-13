import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';

export default function LeagueView() {
  const { id } = useParams();
  const [league, setLeague] = useState(null);
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tab, setTab] = useState('standings');

  useEffect(() => {
    api.getLeague(id).then(setLeague).catch(console.error);
    api.getStandings(id).then(setStandings).catch(console.error);
    api.getMatches(id).then(setMatches).catch(console.error);
  }, [id]);

  if (!league) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  const played = matches.filter(m => m.played);
  const upcoming = matches.filter(m => !m.played);

  const groupByMatchday = (list) => {
    const groups = {};
    for (const m of list) {
      const day = m.matchday || 'Unscheduled';
      if (!groups[day]) groups[day] = [];
      groups[day].push(m);
    }
    return Object.entries(groups).sort((a, b) => a[0] - b[0]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{league.name}</h1>
      <p className="text-gray-500 text-sm mb-6">Season: {league.season}</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {['standings', 'results', 'fixtures'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Standings Table */}
      {tab === 'standings' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-800 text-white">
                <th className="py-2 px-3 text-left">#</th>
                <th className="py-2 px-3 text-left">Team</th>
                <th className="py-2 px-3 text-center">P</th>
                <th className="py-2 px-3 text-center">W</th>
                <th className="py-2 px-3 text-center">D</th>
                <th className="py-2 px-3 text-center">L</th>
                <th className="py-2 px-3 text-center hidden sm:table-cell">GF</th>
                <th className="py-2 px-3 text-center hidden sm:table-cell">GA</th>
                <th className="py-2 px-3 text-center">GD</th>
                <th className="py-2 px-3 text-center font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr key={s.team_id} className={`border-b border-gray-100 ${i === 0 ? 'bg-green-50' : ''}`}>
                  <td className="py-2 px-3 font-medium">{i + 1}</td>
                  <td className="py-2 px-3 font-medium text-gray-800">{s.team_name}</td>
                  <td className="py-2 px-3 text-center">{s.played}</td>
                  <td className="py-2 px-3 text-center">{s.won}</td>
                  <td className="py-2 px-3 text-center">{s.drawn}</td>
                  <td className="py-2 px-3 text-center">{s.lost}</td>
                  <td className="py-2 px-3 text-center hidden sm:table-cell">{s.goals_for}</td>
                  <td className="py-2 px-3 text-center hidden sm:table-cell">{s.goals_against}</td>
                  <td className="py-2 px-3 text-center">{s.goal_difference > 0 ? '+' : ''}{s.goal_difference}</td>
                  <td className="py-2 px-3 text-center font-bold text-green-800">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {standings.length === 0 && <p className="text-center text-gray-400 py-8">No teams or results yet.</p>}
        </div>
      )}

      {/* Results */}
      {tab === 'results' && (
        <div>
          {played.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No results yet.</p>
          ) : (
            groupByMatchday(played).map(([day, dayMatches]) => (
              <div key={day} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Matchday {day}</h3>
                <div className="space-y-2">
                  {dayMatches.map(m => (
                    <div key={m.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between text-sm">
                      <span className="font-medium text-right flex-1">{m.home_team_name}</span>
                      <span className="mx-4 font-bold text-green-800 bg-green-50 px-3 py-1 rounded">
                        {m.home_score} - {m.away_score}
                      </span>
                      <span className="font-medium text-left flex-1">{m.away_team_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Fixtures */}
      {tab === 'fixtures' && (
        <div>
          {upcoming.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No upcoming fixtures.</p>
          ) : (
            groupByMatchday(upcoming).map(([day, dayMatches]) => (
              <div key={day} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Matchday {day}</h3>
                <div className="space-y-2">
                  {dayMatches.map(m => (
                    <div key={m.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between text-sm">
                      <span className="font-medium text-right flex-1">{m.home_team_name}</span>
                      <span className="mx-4 text-gray-400 px-3 py-1">vs</span>
                      <span className="font-medium text-left flex-1">{m.away_team_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
