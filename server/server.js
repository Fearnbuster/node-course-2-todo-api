
// Started: May 3, 2018

require('./config/config');

const bodyParser = require('body-parser');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');
const express = require('express');
const { ObjectID } = require('mongodb');

let { mongoose } = require('./db/mongoose');
let { Todo } = require('./models/todo');
let { User } = require('./models/user');
let { authenticate } = require('./middleware/authenticate');


let app = express();

const port = process.env.PORT;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.post('/todos', (req, res)=>{
  let todo = new Todo({
    text: req.body.text
  });

  todo
    .save()
    .then((todo)=>{
      res.send(todo);
    }, (error)=>{
      res.status(HttpStatus.BAD_REQUEST).send(error);
    });
});

app.get('/todos', (req, res)=>{
  Todo.find()
    .then((todos)=>{
      res.send({ todos });
    }, (error)=>{
      res.status(HttpStatus.BAD_REQUEST).send(error);
    });
});

app.get('/todos/:id', (req, res)=>{
  let id = req.params.id;

  if(!ObjectID.isValid(id)) {
    return res.status(HttpStatus.NOT_FOUND).send();
  }

  Todo.findById(id)
    .then((todo)=>{
      if(todo) {
        res.send({todo});
      } 
      else {
        res.status(HttpStatus.NOT_FOUND).send();
      }
    }, (error)=>{
      res.status(HttpStatus.BAD_REQUEST).send();
    });
});

app.delete('/todos/:id', (req, res)=>{
  let id = req.params.id;

  if(!ObjectID.isValid(id)) {
    return res.status(HttpStatus.NOT_FOUND).send();
  }

  Todo.findByIdAndRemove(id)
    .then((todo)=>{
      if(!todo) {
        res.status(HttpStatus.NOT_FOUND).send();
      }
      else {
        res.send({todo});
      }
    })
    .catch((error) => res.status(HttpStatus.NOT_FOUND).send());
});

app.patch('/todos/:id', (req, res)=>{
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)) {
    return res.status(HttpStatus.NOT_FOUND).send();
  }

  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }
  else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
    .then((todo)=>{
      if(todo) {
        res.send({todo});
      }
      else {
        res.status(HttpStatus.NOT_FOUND).send();
      }
    })
    .catch((error)=>{
      res.status(HttpStatus.BAD_REQUEST).send();
    });
});

app.post('/users', (req, res)=>{
  let body = _.pick(req.body, ['email','password']);
  let newUser = new User(body);

  newUser.save()
    .then(()=>{
      return newUser.generateAuthToken();
    })
    .then((token)=>{
      res.header('x-auth', token).send(newUser);
    })
    .catch((error) => res.status(HttpStatus.BAD_REQUEST).send(error));
});

app.get('/users/me', authenticate,(req, res)=>{
  res.send(req.user);
});

app.post('/users/login', (req, res)=>{
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password)
    .then((user)=>{
      return user.generateAuthToken()
        .then((token)=>{
          res.header('x-auth', token).send(user);
        });
    })
    .catch((error)=>{
      res.status(HttpStatus.BAD_REQUEST).send();
    });
});

app.listen(port, ()=>{
  console.log(`Started on port ${port}...`);
});


module.exports = { app };