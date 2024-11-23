// query the number of tweets in the database and store the result in a Redis key called tweetCount
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
      await redisClient.set('favoritesSum', 0);
  
      const cursor = tweets.find();
      while (await cursor.hasNext()) {
        const tweet = await cursor.next();
        await redisClient.incrBy('favoritesSum', tweet.favorite_count || 0);
      }
  
      const favoritesSum = await redisClient.get('favoritesSum');
      console.log(`Total number of favorites: ${favoritesSum}`);
    } finally {
      await mongoClient.close();
      await redisClient.quit();
    }
  })();