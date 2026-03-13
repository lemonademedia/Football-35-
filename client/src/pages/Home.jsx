import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Home() {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    api.getLeagues().then(setLeagues).catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          35+ Football League
        </h1>
        <p className="text-gray-500 mt-2">Non-KNVB League Management System</p>
      </div>

      {leagues.length === 0 ? (
        <p className="text-center text-gray-400">No leagues created yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {leagues.map(league => (
            <Link
              key={league.id}
              to={`/league/${league.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800">{league.name}</h2>
              <p className="text-gray-500 text-sm mt-1">Season: {league.season}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
