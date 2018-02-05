const redis = require("redis")
const client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
	console.log("Error " + err);
});

client.on("ready", function (err) {
	console.log("Client Ready");
});

client.set("string key", "string meow", redis.print);
client.get("string key", redis.print);

client.hset("hash key", "hashtest 3", "Cat says meow", redis.print);
client.hset(["hash key", "hashtest 5", "some other value"], redis.print);
client.hkeys("hash key", (err, replies) => {
	console.log(replies.length + " replies:");

	replies.forEach((reply, i) => console.log("    " + i + ": " + reply));
	client.quit();
});

client.hget("hash key", "hashtest 3", redis.print);
