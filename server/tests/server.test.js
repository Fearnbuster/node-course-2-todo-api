
// Created: May 4, 2018

const expect = require('expect');
const HttpStatus = require('http-status-codes');
const { ObjectID } = require('mongodb');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { testTodos, testUsers, populateTodos, populateUsers } = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', ()=>{
  it('should create a new todo', (done)=>{
    let text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(HttpStatus.OK)
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
      .expect(HttpStatus.BAD_REQUEST)
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
      .expect(HttpStatus.OK)
      .expect((response)=>{
        expect(response.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', ()=>{
  it('should return todo doc', (done)=>{
    request(app)
      .get(`/todos/${testTodos[0]._id.toHexString()}`)
      .expect(HttpStatus.OK)
      .expect((res)=>{
        expect(res.body.todo.text)
          .toExist()
          .toBe(testTodos[0].text);
      })
      .end(done);
  });

  it(`should return ${HttpStatus.NOT_FOUND} if todo is not found`, (done)=>{
    request(app)
      .post(`/todos/${ObjectID().toHexString()}`)
      .expect(HttpStatus.NOT_FOUND)
      .end(done);
  });

  it(`should return ${HttpStatus.NOT_FOUND} for non-object ids`, (done)=>{
    const invalidID = 123;

    request(app)
      .post(`/todos/${invalidID}`)
      .expect(HttpStatus.NOT_FOUND)
      .end(done);
  });
});

describe('DELETE /todos/:id', ()=>{
  it('should remove a todo', (done)=>{
    let id = testTodos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(HttpStatus.OK)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res)=>{
        if(err) {
          return done(err);
        }

        Todo.findById(id)
          .then((todo)=>{
            expect(todo).toNotExist();
            done();
          }, (error) => done(error));
      });
  });

  it(`should return ${HttpStatus.NOT_FOUND} if todo not found`, (done)=>{
    let unusedID = new ObjectID();

    request(app)
      .delete(`/todos/${unusedID}`)
      .expect(HttpStatus.NOT_FOUND)
      .end(done);
  });

  it(`should return ${HttpStatus.NOT_FOUND} if object id is invalid`, (done)=>{
    let invalidID = 123;

    request(app)
      .delete(`/todos/${invalidID}`)
      .expect(HttpStatus.NOT_FOUND)
      .end(done);
  });
});

describe('PATCH /todos/:id', ()=>{
  it('should update the todo', (done)=>{
    let id = testTodos[0]._id;
    let newText = 'Test patch update';

    request(app)
      .patch(`/todos/${id}`)
      .send({
        text: newText,
        completed: true
      })
      .expect(HttpStatus.OK)
      .expect((res)=>{
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('string');
      })
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done)=>{
    let id = testTodos[1]._id;
    let newText = 'Test patch update 2';

    request(app)
      .patch(`/todos/${id}`)
      .send({
        text: newText,
        completed: false
      })
      .expect(HttpStatus.OK)
      .expect((res)=>{
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('GET /users/me', ()=>{
  it('should return user if authenticated', (done)=>{
    request(app)
      .get('/users/me')
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(HttpStatus.OK)
      .expect((res)=>{
        expect(res.body._id).toBe(testUsers[0]._id.toHexString());
        expect(res.body.email).toBe(testUsers[0].email);
      })
      .end(done);
  });

  it(`should return ${HttpStatus.UNAUTHORIZED} if not authenticated`, (done)=>{
    request(app)
      .get('/users/me')
      .expect(HttpStatus.UNAUTHORIZED)
      .expect((res)=>{
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', ()=>{
  it('should create a user', (done)=>{
    let email = 'test@example.com';
    let password = '123456';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(HttpStatus.OK)
      .expect((res)=>{
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((error)=>{
        if(error){
          return done(error);
        }

        User.findOne({email})
          .then((user)=>{
            expect(user).toExist();
            expect(user.password).toNotBe(password);
            done();
          });
      });
  });

  it('should return validation errors if request is invalid', (done)=>{
    let email = 'invalidEmail.com';
    let password = 'wrong';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(HttpStatus.BAD_REQUEST)
      .end(done);
  });

  it('should not create user if email in use', (done)=>{
    const email = 'user1@example.com';
    const password = '123456';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(HttpStatus.BAD_REQUEST)
      .end(done);
  });
});