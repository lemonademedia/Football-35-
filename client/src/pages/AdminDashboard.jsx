import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);

  // Form states
  const [leagueName, setLeagueName] = useState('');
  const [leagueSeason, setLeagueSeason] = useState('');
  const [teamName, setTeamName] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminTeamId, setAdminTeamId] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      api.getTeams(selectedLeague).then(setTeams).catch(console.error);
      api.getMatches(selectedLeague).then(setMatches).catch(console.error);
    }
  }, [selectedLeague]);

  const loadLeagues = () => api.getLeagues().then(data => {
    setLeagues(data);
    if (data.length > 0 && !selectedLeague) setSelectedLeague(data[0].id);
  });

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handleCreateLeague = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createLeague(leagueName, leagueSeason);
      setLeagueName(''); setLeagueSeason('');
      await loadLeagues();
      setSelectedLeague(created.id);
      flash('League created!');
    } catch (err) { flash(err.message); }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    try {
      await api.createTeam(teamName, selectedLeague);
      setTeamName('');
      api.getTeams(selectedLeague).then(setTeams);
      flash('Team added!');
    } catch (err) { flash(err.message); }
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.assignAdmin(adminTeamId, adminUser, adminPass);
      setAdminUser(''); setAdminPass(''); setAdminTeamId('');
      flash('Team admin created!');
    } catch (err) { flash(err.message); }
  };

  const handleGenerate = async () => {
    try {
      const generated = await api.generateFixtures(selectedLeague);
      setMatches(generated);
      flash(`Generated ${generated.length} fixtures!`);
    } catch (err) { flash(err.message); }
  };

  if (!user || user.role !== 'super_admin') {
    return <div className="text-center py-16 text-gray-400">Access denied</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Super Admin Dashboard</h1>

      {msg && <div className="bg-green-50 text-green-800 border border-green-200 rounded-lg p-3 mb-4 text-sm">{msg}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create League */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Create League</h2>
          <form onSubmit={handleCreateLeague} className="space-y-3">
            <input
              type="text" placeholder="League name" value={leagueName}
              onChange={e => setLeagueName(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
            <input
              type="text" placeholder="Season (e.g. 2025-2026)" value={leagueSeason}
              onChange={e => setLeagueSeason(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button type="submit" className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium">
              Create League
            </button>
          </form>
        </div>

        {/* Select League & Add Team */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Manage Teams</h2>
          <select
            value={selectedLeague || ''}
            onChange={e => setSelectedLeague(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 outline-none"
          >
            <option value="" disabled>Select league</option>
            {leagues.map(l => <option key={l.id} value={l.id}>{l.name} ({l.season})</option>)}
          </select>

          {selectedLeague && (
            <>
              <form onSubmit={handleAddTeam} className="flex gap-2 mb-3">
                <input
                  type="text" placeholder="Team name" value={teamName}
                  onChange={e => setTeamName(e.target.value)} required
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
                <button type="submit" className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
                  Add Team
                </button>
              </form>

              <div className="space-y-1">
                {teams.map(t => (
                  <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span>{t.name}</span>
                    <span className="text-gray-400 text-xs">ID: {t.id}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Assign Team Admin */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Assign Team Admin</h2>
          <form onSubmit={handleAssignAdmin} className="space-y-3">
            <select
              value={adminTeamId}
              onChange={e => setAdminTeamId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="" disabled>Select team</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input
              type="text" placeholder="Username" value={adminUser}
              onChange={e => setAdminUser(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
            <input
              type="password" placeholder="Password" value={adminPass}
              onChange={e => setAdminPass(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button type="submit" className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium">
              Create Team Admin
            </button>
          </form>
        </div>

        {/* Generate Fixtures */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Fixtures</h2>
          {selectedLeague && (
            <>
              <button onClick={handleGenerate} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium mb-3">
                Generate Round-Robin Fixtures
              </button>
              <p className="text-xs text-gray-400 mb-3">
                This will generate a full round-robin schedule for all {teams.length} teams in the selected league.
                Existing fixtures will be replaced.
              </p>
              <div className="text-sm text-gray-600">
                {matches.length} fixtures generated
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
