
// Created: May 7, 2018

const HttpStatus = require('http-status-codes');

let { User } = require('./../models/user');

let authenticate = (req, res, next)=>{
  let token = req.header('x-auth');

  User.findByToken(token)
    .then((user)=>{
      if(!user) {
        return Promise.reject();
      }

     req.user = user;
     req.token = token;
     next();
    })
    .catch((error)=>{
      res.status(HttpStatus.UNAUTHORIZED).send();
    });
};

module.exports = { authenticate };