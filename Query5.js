import { MongoClient } from 'mongodb';
import { createClient } from 'redis';

(async () => {
  const mongoClient = new MongoClient('mongodb://localhost:37017');
  const redisClient = createClient();

  try {
    await mongoClient.connect();
    const db = mongoClient.db("ieeevisTweets");
    const tweets = db.collection('tweet');

    await redisClient.connect();
    const cursor = tweets.find();

    while (await cursor.hasNext()) {
      const tweet = await cursor.next();
      const tweetId = tweet._id.toString();

      await redisClient.rPush(`tweets:${tweet.user.screen_name}`, tweetId);
      await redisClient.hSet(`tweet:${tweetId}`, {
        user_name: tweet.user.name,
        text: tweet.text,
        created_at: tweet.created_at,
      });
    }

    console.log('Tweets by user have been stored in Redis.');
  } finally {
    await mongoClient.close();
    await redisClient.quit();
  }
})();
