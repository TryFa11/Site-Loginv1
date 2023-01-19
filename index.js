const session = require("express-session");
const get_ip = require('ipware')().get_ip;
const bodyParser = require("body-parser");
const crypto = require("crypto-js");
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const app = express();

//MiddleWare
app.use(express.static(path.join(__dirname, '/resources/public')));
app.use(helmet({XContentTypeOptions: false}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  name: "session",
  secret: 'User',
  saveUninitialized: true,
  resave: false,
  cookie: {maxAge: 1000 * 60 * 60 * 24 }
}));


//Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
mongoose.connect(process.env['URL'], { useNewUrlParser: true, useUnifiedTopology: true });
const Client = require('./resources/Database/Mongoose');

//Errors
const errors = ["Incorrect Username or Password", "Please Enter a Valid Email", "You already own an account."];

//Web Pages
app.get('/', (req, res) => { res.redirect('/home') });
app.get('/:page', (req, res) => {
  const format = req.body;
  if (req.params.page === 'register') {
    res.sendFile(path.join(__dirname + '/resources/public/register.html'));
  } else if (req.params.page === 'login') {
    res.sendFile(path.join(__dirname + '/resources/public/login.html'));
  } else if (req.params.page === 'home') {
    res.sendFile(path.join(__dirname + '/resources/public/home.html'));
  } else if (req.params.page === 'policy') {
    res.sendFile(path.join(__dirname + '/resources/public/policy.html'));
  } else if (req.params.page === 'terms') {
    res.sendFile(path.join(__dirname + '/resources/public/terms.html'));
  } else {
    res.sendStatus(404);
  }
});

//Database & Autherization Middleware
app.all('/auth/:method',  (req, res) => {
  var format = req.body;
  var ip_info = get_ip(req);
  function xor(a, b) {
    let c = "";
    for (let i = 0; i < a.length; i++) {
      c += `${String.fromCharCode(a.charCodeAt(i) ^ b)}`
    }
    return c;
  }
  var encrypted = xor(ip_info.clientIp, process.env['KEY']);
  var pasxor = xor(format.password, process.env['KEY']);
  if (req.params.method === 'login') {
    Client.find({ username: format.username }).then((result) => {
      if (null) {
        res.send(errors[0]);
      } else if (result[0].password === pasxor) {
        req.session.username = format.username;
        console.log(req.session.username);
        res.redirect('/home');
      } else {
        res.send(errors[0]);
      }
    });
  } else if (req.params.method === 'register') {
    Client.find({ id: encrypted }).then((result) => {
      if (result[0]) {
        res.send(errors[2]);
      } else {
        const User = new Client({
          username: format.username,
          password: pasxor,
          id: encrypted
        });
        req.session.username = format.username;
        User.save(); //MongoDB
        res.redirect('/home');
      }
    });
  }
});
app.listen(3000);