export async function getSearchConsoleSnapshot() {
  return {
    connected: false,
    message: 'Connect Google Search Console to show clicks, impressions, CTR, and average position.',
    metrics: { clicks: null, impressions: null, ctr: null, averagePosition: null }
  };
}

// TODO: Implement OAuth and Search Console API calls when Google credentials are supplied.
