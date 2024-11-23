import { MongoClient } from 'mongodb';
import { createClient } from 'redis';

(async () => {
  const mongoClient = new MongoClient('mongodb://localhost:37017');
  const redisClient = createClient();

  try {
    await mongoClient.connect();
    const db = mongoClient.db('ieeevisTweets');
    const tweets = db.collection('tweet');

    await redisClient.connect();
    const cursor = tweets.find();

    const distinctUsers = await tweets.distinct('user.screen_name');
    for (const user of distinctUsers) {
      if (typeof user === 'string' && user.trim().length > 0) {
        await redisClient.zAdd('leaderboard', { score: 0, value: user });
      }
    }

    while (await cursor.hasNext()) {
      const tweet = await cursor.next();
      await redisClient.zIncrBy('leaderboard', 1, tweet.user.screen_name);
    }

    const topUsers = await redisClient.zRangeWithScores('leaderboard', 0, 9, {REV: true});
    console.log('Leaderboard:', topUsers);
  } finally {
    await mongoClient.close();
    await redisClient.quit();
  }
})();
