
// Started: May 3, 2018

let bodyParser = require('body-parser');
let express = require('express');


let { mongoose } = require('./db/mongoose');
let { Todo } = require('./models/todo');
let { User } = require('./models/user');


let app = express();

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


app.listen(3000, ()=>{
  console.log('Started on port 3000...');
});

app.get('/todos', (req, res)=>{
  Todo.find()
    .then((todos)=>{
      res.send({ todos });
    }, (error)=>{
      res.status(400).send(error);
    });
});


module.exports = { app };