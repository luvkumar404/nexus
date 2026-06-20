export async function getBacklinkAnalysis() {
  return {
    available: false,
    message: 'Connect Ahrefs, Semrush, Moz, Majestic, or Google Search Console API to fetch backlink data.',
    metrics: {
      domainAuthority: null,
      referringDomains: null,
      backlinks: null,
      toxicLinks: null,
      anchorTextDistribution: []
    }
  };
}

// TODO: Add provider clients for Ahrefs, Semrush, Moz, Majestic, or GSC when API keys are configured.
