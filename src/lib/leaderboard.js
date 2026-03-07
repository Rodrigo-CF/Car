function mapUsers(store) {
  const map = new Map();
  for (const user of store.users) {
    map.set(user.user_id, user.username);
  }
  return map;
}

export function buildTheoryLeaderboard(store, limit = 50) {
  const usernames = mapUsers(store);
  return [...store.examAttempts]
    .sort((a, b) => {
      if (b.score_pct !== a.score_pct) {
        return b.score_pct - a.score_pct;
      }
      return a.duration_sec - b.duration_sec;
    })
    .slice(0, limit)
    .map((row, idx) => ({
      rank: idx + 1,
      user_id: row.user_id,
      username: usernames.get(row.user_id) ?? "unknown",
      score_pct: row.score_pct,
      correct_count: row.correct_count,
      duration_sec: row.duration_sec,
      passed: row.passed,
      created_at: row.created_at,
    }));
}

export function buildSimulationLeaderboard(store, limit = 50) {
  const usernames = mapUsers(store);
  return [...store.simSessions]
    .sort((a, b) => {
      if (b.score_pct !== a.score_pct) {
        return b.score_pct - a.score_pct;
      }
      if (a.critical_fail !== b.critical_fail) {
        return Number(a.critical_fail) - Number(b.critical_fail);
      }
      return a.duration_sec - b.duration_sec;
    })
    .slice(0, limit)
    .map((row, idx) => ({
      rank: idx + 1,
      user_id: row.user_id,
      username: usernames.get(row.user_id) ?? "unknown",
      route_id: row.route_id,
      score_pct: row.score_pct,
      critical_fail: row.critical_fail,
      fail_reason: row.fail_reason,
      duration_sec: row.duration_sec,
      created_at: row.created_at,
    }));
}

export function buildUserProfile(store, userId) {
  const theoryHistory = store.examAttempts
    .filter((attempt) => attempt.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const simulationHistory = store.simSessions
    .filter((session) => session.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const bestTheoryScore = theoryHistory.reduce(
    (best, current) => (current.score_pct > best ? current.score_pct : best),
    0,
  );

  const bestSimulationScore = simulationHistory.reduce(
    (best, current) => (current.score_pct > best ? current.score_pct : best),
    0,
  );

  return {
    bestTheoryScore,
    bestSimulationScore,
    theoryHistory,
    simulationHistory,
  };
}
