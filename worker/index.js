const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000 // if lost connection, try to reconnet every 1sec
});
const sub = redisClient.duplicate();

function fib(index) {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
}

sub.on('message', (channel, message) => { // When new value appear in redis
    redisClient.hset('values', message, fib(parseInt(message)));
});
sub.subscribe('insert');