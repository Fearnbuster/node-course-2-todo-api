
// Created: May 4, 2018

const expect = require('expect');
const request = require('supertest');

let { app } = require('./../server');
const { Todo } = require('./../models/todo');

const testTodos = [{
  text: 'First test todo'
}, {
  text: 'Second test todo'
}];

beforeEach(function(done){
  this.timeout(5000);

  Todo.remove()
    .then((result)=>{
      return Todo.insertMany(testTodos);
    })
    .then((result) => {
      done()
    });
});

describe('POST /todos', ()=>{
  it('should create a new todo', (done)=>{
    let text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((response)=>{
        expect(response.body.text)
          .toExist()
          .toBe(text);
      })
      .end((err, res)=>{
        if(err){
          return done(err);
        }

        Todo.find({ text })
          .then((todos)=>{
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch((error) => done(error));
      });
  }); 

  it('should not create todo with invalid body data', (done)=>{

    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res)=>{
        if(err){
          return done(err);
        }

        Todo.count()
          .then((count)=>{
            expect(count).toBe(2);

            done();
          })
          .catch((error) => done(error));
      });
  });
});

describe('GET /todos', ()=>{
  it('should get all todos', (done)=>{
    request(app)
      .get('/todos')
      .expect(200)
      .expect((response)=>{
        expect(response.body.todos.length).toBe(2);
      })
      .end(done);
  });
});