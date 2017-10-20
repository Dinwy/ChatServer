'use strict';

const express = require('express');
const socketIO = require('socket.io');
const uuid = require('uuid');
const app = express();
const server = require('http').createServer(app);
const io = socketIO(server);

server.listen(8080);
io.set('heartbeat interval', 1000);
io.set('heartbeat timeout', 1200);

app.use('/', express.static(process.cwd() + '/www'));

let clients = {};

function getClientList() {
	let clientList = [];
	for (let clientId in clients) {
		let client = clients[clientId];
		clientList.push(client.name);
	}
	return clientList;
}

// Keep your code clean by Cedric
io.on('connection', function (socket) {
	console.log('Connected');
	let clientId = uuid.v4();

	let client = {
		socket: socket,
		name: 'Anonymous',
		uuid: clientId
	};

	clients[socket.id] = client;

	socket.join('roomA');
	io.to('roomA').emit('userlist', getClientList());

	socket.on('sendMsg', function (data) {
		socket.emit('getMsg', { name: client.name, msg: data.msg });
		socket.broadcast.emit('getMsg', { name: client.name, msg: data.msg });
	});

	socket.on('changeName', function (data) {
		console.log(`${data}`);
		clients[socket.id] = client;
		client.name = data.name;
		io.to('roomA').emit('userlist', getClientList());
	});

	socket.on('disconnect', function () {
		console.log("Disconnected");
		delete clients[socket.id];
		io.to('roomA').emit('userlist', getClientList());
	});
});
