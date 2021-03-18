const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();

app.listen(3001, function() {
	console.log("Server is starting: port=3001");
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function (request, response) {
	response.sendFile(__dirname + "/1.html");
});

app.get("/signup", function (request, response) {
	response.sendFile(__dirname + "/signup.html");
});

app.post("/signup", function (request, response) {
	let email = request.body.email;
	let confpwd = request.body.confpwd;
	let username = request.body.username;
	let password = request.body.pwd;
	if (confpwd == password) {
		fs.readFile('users.json', function(err, data) {
			let newData = JSON.parse(data);
			let users = newData["users"];
			let is_exist = false;
			for (var i = 0; i < users.length; i++) {
				if (username == users[i]["username"] && password == users[i]["password"]) {
					is_exist = true;
					break;
				}
			}
			if (is_exist == false) {
				users.push({"username":username, "email":email, "password":password});
				let userList = JSON.stringify({"users":users});
				fs.writeFile('users.json', userList, (err) => {
				    if (err) throw err;
				    console.log('Registering the user');
				});
			}
		});
	}
	response.redirect("/");
});

app.get("/login", function (request, response) {
	response.sendFile(__dirname + "/login.html");
});

app.post("/login", function (request, response) {
	fs.readFile('users.json', function(err, data) {
		let newData = JSON.parse(data);
		let users = newData["users"];
		let username = request.body.username;
		let password = request.body.password;
		let is_exist = false;
		for (var i = 0; i < users.length; i++) {
			if (username == users[i]["username"] && password == users[i]["password"]) {
				response.redirect("/teachers");
				let loginUser = JSON.stringify({"username":username, "favourites":[]});
				fs.writeFile('favourites.json', loginUser, (err) => {
				    if (err) throw err;
				    console.log('Creating the favourites');
				});
				is_exist = true;
				break;
			}
		}
		if (is_exist == false) {
			response.redirect("/login");
		}
	});
});

app.get("/teachers", function (request, response) {
	response.sendFile(__dirname + "/teachers.html");
});

app.post("/teachers", function (request, response) {
	let data = {"fullname": request.body.fullname, "examresult": request.body.examresult, "contacts": request.body.contacts};
	fs.readFile('favourites.json', function(err, readData) {
		let newData = JSON.parse(readData);
		if (newData["username"] != "") {
			let favourites = newData["favourites"];
			let is_exist = false;
			for (var i = 0; i < favourites.length; i++) {
				if (request.body.contacts == favourites[i]["contacts"]) {
					is_exist = true;
					break;
				}
			}
			if (is_exist == false) {
				favourites.push(data);
				let favouritesList = JSON.stringify({"username": newData["username"], "favourites":favourites});
				fs.writeFile('favourites.json', favouritesList, (err) => {
				    if (err) throw err;
				    console.log('Adding new favourites');
				});
			}
		}
	});
	response.redirect("/teachers");
});

app.get("/favourites", function (request, response) {
	response.sendFile(__dirname + "/favourites.html");
});

app.post("/favourites", function (request, response) {
	let empty = JSON.stringify({"username":"", "favourites":[]});
	fs.writeFile('favourites.json', empty, (err) => {
	    if (err) throw err;
	    console.log('Removing all');
	});
	response.redirect("/");
});

app.get("/favourites.json", function (request, response) {
	response.sendFile(__dirname + "/favourites.json");
});
