
// Created: May 7, 2018

const jwt = require('jsonwebtoken');
const { ObjectID } = require('mongodb');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const testUsers = [{
  _id: userOneID,
  email: 'user1@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneID, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoID,
  email: 'user2@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoID, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}];

const testTodos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneID
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoID
}];

const populateTodos = function(done){
  this.timeout(5000);

  Todo.remove()
    .then((result)=>{
      return Todo.insertMany(testTodos);
    })
    .then((result) => {
      done()
    });
}

const populateUsers = function(done){
  this.timeout(5000);

  User.remove()
    .then(()=>{
      let userOne = new User(testUsers[0]).save();
      let userTwo = new User(testUsers[1]).save();

      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
}

module.exports = {
  testTodos,
  testUsers,
  populateTodos,
  populateUsers
};