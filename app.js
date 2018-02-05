'use strict';

const express = require('express');
const socketIO = require('socket.io');
const uuid = require('uuid');
const app = express();
const server = require('http').createServer(app);
const io = socketIO(server);
const redis = require("redis")

server.listen(8080);
io.set('heartbeat interval', 1000);
io.set('heartbeat timeout', 1200);

app.use('/', express.static(process.cwd() + '/www'));

// Predefined room name
const roomName = 'roomA';

// Keep your code clean by Cedric
io.on('connection', (socket) => {
	const client = redis.createClient();
	const clientId = uuid.v4();

	// Create information
	let clientData = {
		socket: socket,
		name: 'Anonymous',
		uuid: clientId
	};

	client.on("error", (err) => console.error(err));
	client.on("ready", (err) => {
		client.hmset(`user:${clientId}`, 'name', clientData.name, 'uuid', clientData.uuid, redis.print)
		console.log(`Client ready`)
	});

	socket.join(roomName, (err) => {
		if (err) {
			socket.disconnect();
			console.log('Error has been ocurred');
			return;
		}

		// Save clientIds
		client.sadd(`room:${roomName}:users`, clientData.name)
	});

	client.smembers(`room:${roomName}:users`, (err, users) => {
		if (err) return

		console.log(`users: ${users}`)
		if (users.length )
		io.to(roomName).emit('userlist', users);
	});

	socket.on('sendMsg', (data) => {
		socket.emit('getMsg', { name: client.name, msg: data.msg });
		socket.broadcast.emit('getMsg', { name: client.name, msg: data.msg });
	});

	socket.on('changeName', (data) => {
		console.log(`${JSON.stringify(data)}`);
	});

	socket.on('disconnect', () => {
		console.log(`${clientId} Disconnected`);

		const room = io.sockets.adapter.rooms[roomName];
		console.log(room);

		client.del(`user:${clientId}`, redis.print)
		// io.to('roomA').emit('userlist', getClientList());
	});
});
