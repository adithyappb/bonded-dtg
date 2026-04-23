export const apiPrefix = "/v1";

export const routes = {
  health: "/health",
  auth: {
    challenge: `${apiPrefix}/auth/wallet/challenge`,
    verify: `${apiPrefix}/auth/wallet/verify`,
    devLogin: `${apiPrefix}/auth/wallet/dev-login`,
    session: `${apiPrefix}/auth/session`,
    logout: `${apiPrefix}/auth/logout`
  },
  wallet: {
    me: `${apiPrefix}/wallet/me`,
    balance: `${apiPrefix}/wallet/balance`,
    displayPreferences: `${apiPrefix}/wallet/display-preferences`
  },
  chain: {
    networks: `${apiPrefix}/chain/networks`,
    recordTransaction: `${apiPrefix}/chain/transactions`,
    transactionStatus: `${apiPrefix}/chain/transactions/:chainId/:hash`
  },
  staking: {
    config: `${apiPrefix}/staking/config`,
    intents: `${apiPrefix}/staking/intents`,
    intentStatus: `${apiPrefix}/staking/intents/:intentId/status`,
    intentTransaction: `${apiPrefix}/staking/intents/:intentId/transactions`
  },
  crypto: {
    config: `${apiPrefix}/crypto/config`,
    paymentIntents: `${apiPrefix}/crypto/payment-intents`,
    paymentIntent: `${apiPrefix}/crypto/payment-intents/:intentId`,
    paymentTransaction: `${apiPrefix}/crypto/payment-intents/:intentId/transactions`
  },
  nft: {
    collections: `${apiPrefix}/nft/collections`,
    mintIntents: `${apiPrefix}/nft/mint-intents`,
    mintIntent: `${apiPrefix}/nft/mint-intents/:intentId`,
    mintTransaction: `${apiPrefix}/nft/mint-intents/:intentId/transactions`,
    ownership: `${apiPrefix}/nft/ownership/:profileId`
  },
  profiles: {
    me: `${apiPrefix}/profiles/me`,
    public: `${apiPrefix}/profiles/:profileId`
  },
  discovery: {
    feed: `${apiPrefix}/discovery/feed`,
    swipe: `${apiPrefix}/discovery/swipes`,
    filters: `${apiPrefix}/discovery/filters`
  },
  matches: {
    list: `${apiPrefix}/matches`,
    likesYou: `${apiPrefix}/matches/likes-you`,
    unmatch: `${apiPrefix}/matches/:matchId/unmatch`
  },
  messages: {
    threads: `${apiPrefix}/messages/threads`,
    thread: `${apiPrefix}/messages/threads/:threadId`,
    send: `${apiPrefix}/messages/threads/:threadId/messages`
  },
  dates: {
    list: `${apiPrefix}/dates`,
    detail: `${apiPrefix}/dates/:dateId`,
    propose: `${apiPrefix}/dates`,
    outcome: `${apiPrefix}/dates/:dateId/outcome`
  },
  matchmaker: {
    candidates: `${apiPrefix}/matchmaker/candidates`,
    recommendations: `${apiPrefix}/matchmaker/recommendations`,
    rewards: `${apiPrefix}/matchmaker/rewards`
  },
  reputation: {
    profile: `${apiPrefix}/reputation/:profileId`
  },
  achievements: {
    catalog: `${apiPrefix}/achievements`,
    mine: `${apiPrefix}/achievements/me`
  },
  spark: {
    balance: `${apiPrefix}/spark/balance`,
    boosts: `${apiPrefix}/spark/boosts`
  },
  billing: {
    plans: `${apiPrefix}/billing/plans`,
    checkout: `${apiPrefix}/billing/checkout`,
    status: `${apiPrefix}/billing/status`
  },
  compatibility: {
    score: `${apiPrefix}/compatibility/score`
  },
  notifications: {
    list: `${apiPrefix}/notifications`,
    markRead: `${apiPrefix}/notifications/:notificationId/read`
  },
  moderation: {
    report: `${apiPrefix}/moderation/reports`,
    block: `${apiPrefix}/moderation/blocks`
  }
} as const;
