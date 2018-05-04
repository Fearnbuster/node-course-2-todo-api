
// Created: May 4, 2018

let mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {
  mongoose
};