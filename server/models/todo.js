

// Created: May 4, 2018

let mongoose = require('mongoose');

let TodoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

let Todo = mongoose.model('Todo', TodoSchema);

module.exports = {
  Todo
};