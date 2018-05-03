

// Started: May 3, 2018

// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client)=>{
  if(err){
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  const db = client.db('TodoApp');

  // deleteMany:
  // db.collection('Todos')
  //   .deleteMany({
  //     text: 'Eat lunch'
  //   })
  //   .then((result)=>{
  //     console.log(result);
  //   });

  // deleteOne:
  // db.collection('Todos')
  //   .deleteOne({
  //     text: 'Eat lunch'
  //   })
  //   .then((result)=>{
  //     console.log(result);
  //   });

  // findOneAndDelete:
  // db.collection('Todos')
  //   .findOneAndDelete({
  //     text: 'Eat lunch'
  //   })
  //   .then((result)=>{
  //     console.log(result);
  //   });

  db.collection('Users')
    .deleteMany({
      name: 'Seth'
    })
    .then((result)=>{
      console.log(result);
    });

  db.collection('Users')
    .findOne({
      name: 'Abraham'
    })
    .then((user)=>{
      db.collection('Users')
        .deleteOne({
          _id: user._id
        })
        .then((result)=>{
          console.log(result);
        });
    });

  //client.close();
});