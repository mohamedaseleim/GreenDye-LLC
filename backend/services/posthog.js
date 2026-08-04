const { PostHog } = require('posthog-node');

const apiKey = process.env.POSTHOG_API_KEY;
const apiHost = process.env.POSTHOG_HOST || 'https://app.posthog.com';

let client = null;

if (apiKey) {
  client = new PostHog(apiKey, { host: apiHost });
}

module.exports = client;
