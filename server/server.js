
// Started: May 3, 2018

let bodyParser = require('body-parser');
let express = require('express');
let { ObjectID } = require('mongodb');

let { mongoose } = require('./db/mongoose');
let { Todo } = require('./models/todo');
let { User } = require('./models/user');


let app = express();

const port = process.env.PORT || 3000;


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
      res.status(400).send(error);
    });
});

app.get('/todos', (req, res)=>{
  Todo.find()
    .then((todos)=>{
      res.send({ todos });
    }, (error)=>{
      res.status(400).send(error);
    });
});

app.get('/todos/:id', (req, res)=>{
  let id = req.params.id;

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id)
    .then((todo)=>{
      if(todo) {
        res.send({todo});
      } 
      else {
        res.status(404).send();
      }
    }, (error)=>{
      res.status(400).send();
    });
});

app.listen(port, ()=>{
  console.log(`Started on port ${port}...`);
});


module.exports = { app };