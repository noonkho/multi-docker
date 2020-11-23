const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();  // create a new express applicatioin, object that receive and respond to any http requests from react
app.use(cors()); // Cross origin resource sharing, make requests from one domain that react is running on to a different domain or port that express api is hosted on
app.use(bodyParser.json()); // parse incoming requests from react and turn the body value to json so that expresss API can ver y easily work with

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost PG connection'));

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.log(err));

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate(); // a connection to listen or subscribe or publish info, cannot use for other purposes

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => { // used to query running postgres instance and retrieve all values ever been submit to post
  const values = await pgClient.query('SELECT * from values'); // from values, pull all info

  res.send(values.rows); // .rows is only send back the actual information
});

app.get('/values/current', async (req, res) => { // redis and retrieve all different values, indices, & calculated values that ever sent to redis
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

app.post('/values', async (req, res) => { // receive new values from react
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!'); // value of the index has nothing yet
  redisPublisher.publish('insert', index); // wake up worker process and calculate the value
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });
});

app.listen(5000, err => {
  console.log('Listening');
});