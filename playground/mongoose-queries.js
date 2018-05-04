
// Created: May 4, 2018


const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');


// let id = '5aecb5a54431a93d08ed836411';


// if(!ObjectID.isValid(id)){
//   console.log('ID not valid');
// }


// Todo.find({
//   _id: id
// }).then((todos)=>{
//   console.log('Todos', todos);
// });

// Todo.findOne({
//   _id: id
// }).then((todo)=>{
//   console.log('Todo', todo);
// });

// Todo.findById(id).then((todo)=>{
//   if(!todo){
//     return console.log('Id not found');
//   }

//   console.log('Todo by ID', todo);
// }).catch((error) => console.log(error));

User.findById('5aebb2bc6369852d40d51c1f')
  .then((user)=>{
    if(user){
      console.log('User found: ', user);
    } 
    else {
      console.log('User not found.');
    }
  })
  .catch((error) => console.log(error));