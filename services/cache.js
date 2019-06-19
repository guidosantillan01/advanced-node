const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

// Create .cache() function to all Queries
mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');

  return this; // Do this to be able to chain function calls like Blog.find().cache().limit()... etc.
};

mongoose.Query.prototype.exec = async function() {
  // ? `this` in this function is a reference to the query instance we are executing (Query.prototype.exec)
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  // console.log(this.getQuery());
  // console.log(this.mongooseCollection.name);
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  // See if we have a value for 'key' in redis
  const cacheValue = await client.hget(this.hashKey, key);

  // if we do, return that
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  // Otherwise, issue the query and store the result in redis
  const result = await exec.apply(this, arguments);

  client.hset(this.hashKey, key, JSON.stringify(result));
  client.expire(this.hashKey, 10);

  return result;
};
