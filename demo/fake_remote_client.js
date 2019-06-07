// This is fake client that will connect to server and send packets
// Nothing to see here really. Logger will not be used for client-side code

// Don't use this code, it has only basic functionality for demo

const net = require('net');
const config = require('./config');

function FakeRemoteClient(app) {
	this.ip = null;
	this.port = null;
	this.connected = false;
	this.socket = null;
	this.app = app;

	this.queue = [];
}

FakeRemoteClient.prototype.addTask = function () {
	this.queue.push(Array.from(arguments));
};

FakeRemoteClient.prototype.start = function () {
	this.nextTask();
};

FakeRemoteClient.prototype.nextTask = function () {
	if(!this.queue.length) return;
	let task_param = this.queue.shift();
	let task_fn = this.tasks[task_param.shift()];

	let client = this;
	setTimeout(function () {
		task_fn.apply(client, task_param);
	}, config.demo_delay);
};

FakeRemoteClient.prototype.createConnection = function () {
	this.socket = new net.Socket();
	this.socket.setEncoding('utf8');
	this.socket.on('connect', this.onConnect.bind(this));
	this.socket.on('close', this.onClose.bind(this));
	this.socket.on('error', function () {});
	this.socket.connect(this.port, this.ip);
};

FakeRemoteClient.prototype.onConnect = function () {
	this.connected = true;
	this.nextTask();
};

FakeRemoteClient.prototype.onClose = function () {
	this.connected = false;
	this.socket.removeAllListeners();

	this.socket = null;
};

FakeRemoteClient.prototype.tasks = {
	connect: function (ip, port) {
		this.ip = ip;
		this.port = port;

		this.createConnection();
	},

	reconnect: function () {
		if(this.connected) {
			this.socket.removeAllListeners();
			this.socket.on('error', function () {});
			this.socket.end();
		}

		this.createConnection();
	},

	comment: function (msg) {
		this.app.log.info(this.app.log.invert('magentaLight', msg));
		this.nextTask();
	},

	send: function (obj) {
		let client = this;
		this.socket.write(JSON.stringify(obj) + '\n', 'utf8', function () {
			client.nextTask();
		});
	},

	send_raw: function (data) {
		let client = this;
		this.socket.write(data, 'utf8', function () {
			client.nextTask();
		});
	}
};

module.exports = FakeRemoteClient;