var socket = io.connect(window.document.location.herf);
var chatBox = document.getElementById('chatBox');
var userList = document.getElementById('user-list');
var message = document.getElementById('message');

document.getElementById('message').onkeydown = function (event) {
	if (event.keyCode === 13) {
		if (!message.value) {
			return false;
		}

		sendMsg();
		return false;
	}

};

function sendMsg() {
	socket.emit('sendMsg', { msg: message.value });
	message.value = '';
}

socket.on('getMsg', function (rcvData) {
	chatBox.value += rcvData.name + ': ' + rcvData.msg + '\n';
	chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('userlist', function (data) {
	userList.innerHTML = '';
	for (var i = 0; i < data.length; i++) {
		var newLi = document.createElement("li");
		newLi.innerHTML = data[i];
		userList.appendChild(newLi);
	}
});

document.getElementById('changeNameButton').addEventListener('click', changeName);

function changeName() {
	var newName = prompt("Please enter your name", "Cedric");
	var nameBox = document.getElementById('name-box');

	if (newName != null) {
		nameBox.innerHTML = 'Name: ' + newName;	
		socket.emit('changeName', { name : newName });
    }
}