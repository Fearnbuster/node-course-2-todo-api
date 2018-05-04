
// Created: May 4, 2018

const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

// Todo.remove({})
//   .then((result)=>{
//     console.log(result);
//   });

// Todo.findOneAndRemove()
// Todo.findByIdAndRemove()

// Todo.findOneAndRemove({_id: '5aece8ef9712b82a1889c853'})
//   .then((todo)=>{

//   });

// Todo.findByIdAndRemove('5aece8ef9712b82a1889c853')
//   .then((todo)=>{
//     console.log(todo);
//   });