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

        while (await cursor.hasNext()) {
            const tweet = await cursor.next();
            await redisClient.sAdd('screen_names', tweet.user.screen_name);
        }

        const userCount = await redisClient.sCard('screen_names');
        console.log(`Total distinct users: ${userCount}`);
    } finally {
        await mongoClient.close();
        await redisClient.quit();
    }
})();