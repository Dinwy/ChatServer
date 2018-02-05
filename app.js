`use strict`

const express = require(`express`)
const socketIO = require(`socket.io`)
const uuid = require(`uuid`)
const app = express()
const server = require(`http`).createServer(app)
const io = socketIO(server)
const redis = require("redis")

server.listen(8080)
io.set(`heartbeat interval`, 1000)
io.set(`heartbeat timeout`, 1200)

app.use(`/`, express.static(process.cwd() + `/www`))

// Predefined room name
const roomName = `roomA`

// Keep your code clean
io.on(`connection`, (socket) => {
	const client = redis.createClient()
	let clientData = {
		name: 'Anonymous',
		uuid: uuid.v4()
	}

	client.on("error", (err) => console.error(err))
	client.on("ready", (err) => {
		client.hmset(`user:${clientData.uuid}`, `name`, clientData.name, `uuid`, clientData.uuid, redis.print)
		console.log(`Client ready`)
	})

	socket.join(roomName, (err) => {
		if (err) {
			socket.disconnect()
			return
		}

		// Save clientData.uuids
		client.hset(`room:${roomName}:users`, clientData.uuid, clientData.name)
		client.hvals(`room:${roomName}:users`, (err, users) => io.to(roomName).emit(`userlist`, users))
	})

	socket.on(`sendMsg`, (data) => {
		io.in(roomName).emit(`getMsg`, { name: clientData.name, msg: data.msg })
	})

	socket.on(`changeName`, (data) => {
		// Update data name
		clientData.name = data.name

		client.hset(`room:${roomName}:users`, clientData.uuid, data.name, (err) => {
			client.hvals(`room:${roomName}:users`, (err, users) => io.to(roomName).emit(`userlist`, users))
		})
	})

	socket.on(`disconnect`, () => {
		console.log(`${clientData.uuid} has been disconnected`)

		// Delete client data
		client.del(`user:${clientData.uuid}`, redis.print)

		// Delete user from room
		client.hdel(`room:${roomName}:users`, clientData.uuid, client.hget(`user:${clientData.uuid}`, `name`),
			(err) => client.hvals(`room:${roomName}:users`, (err, users) => io.to(roomName).emit(`userlist`, users))
		)
	})
})
