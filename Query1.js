// Query counts the number of tweets in the collection and stores the count in Redis.
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
    await redisClient.set('tweetCount', 0);

    const count = await tweets.countDocuments();
    await redisClient.INCRBY('tweetCount', count);

    const tweetCount = await redisClient.get('tweetCount');
    console.log(`There were ${tweetCount} tweets`);
  } finally {
    await mongoClient.close();
    await redisClient.quit();
  }
})();
