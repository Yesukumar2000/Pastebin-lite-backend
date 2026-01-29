const { Redis } = require('@upstash/redis');

// In-memory storage (development fallback)
const memoryStore = new Map();

const InMemoryStore = {
  async save(id, data) {
    memoryStore.set(id, data);
  },
  async get(id) {
    return memoryStore.get(id) || null;
  },
  async ping() {
    return 'PONG';
  }
};

// Redis storage (production)
function createRedisStore(client) {
  return {
    async save(id, data) {
      await client.set(`paste:${id}`, JSON.stringify(data));
    },
    async get(id) {
      const data = await client.get(`paste:${id}`);
      return data ? JSON.parse(data) : null;
    },
    async ping() {
      return await client.ping();
    }
  };
}

// Select storage based on environment
function createStorage() {
  const hasRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

  if (hasRedis) {
    console.log('Using Redis storage');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return createRedisStore(redis);
  }

  console.log('Using in-memory storage');
  return InMemoryStore;
}

module.exports = { storage: createStorage() };
