const express = require('express')
const app = express()

function init(port) {
	app.listen(port, function () {
		console.log('API listening on port',port)
	})
	return (app);
}

function send_http_pkg(app, path, pkg) {
	app.get(path, function (req, res) {
		res.send(pkg);
	})
}

function receive_http_pkg(app, path, pkg) {
	app.get(path, function (req, res) {
		req.body;
	})
}

module.exports = {
	init:init
}
