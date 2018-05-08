
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
      .set('x-auth', testUsers[0].tokens[0].token)
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
      .set('x-auth', testUsers[0].tokens[0].token)
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
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(HttpStatus.OK)
      .expect((response)=>{
        expect(response.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', ()=>{
  it('should return todo doc', (done)=>{
    request(app)
      .get(`/todos/${testTodos[0]._id.toHexString()}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(HttpStatus.OK)
      .expect((res)=>{
        expect(res.body.todo.text)
          .toExist()
          .toBe(testTodos[0].text);
      })
      .end(done);
  });

  it('should not return todo doc created by another user', (done)=>{
    request(app)
      .get(`/todos/${testTodos[1]._id.toHexString()}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(HttpStatus.NOT_FOUND)
      .end(done);
  });

  it(`should return ${HttpStatus.NOT_FOUND} if todo is not found`, (done)=>{
    request(app)
      .get(`/todos/${ObjectID().toHexString()}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(HttpStatus.NOT_FOUND)
      .end(done);
  });

  it(`should return ${HttpStatus.NOT_FOUND} for non-object ids`, (done)=>{
    const invalidID = 123;

    request(app)
      .post(`/todos/${invalidID}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(HttpStatus.NOT_FOUND)
      .end(done);
  });
});

describe('DELETE /todos/:id', ()=>{
  it('should remove a todo', (done)=>{
    let id = testTodos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', testUsers[1].tokens[0].token)
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

  it('should not remove a todo created by another user', (done)=>{
    let id = testTodos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', testUsers[1].tokens[0].token)
      .expect(HttpStatus.NOT_FOUND)
      .end((err, res)=>{
        if(err) {
          return done(err);
        }

        Todo.findById(id)
          .then((todo)=>{
            expect(todo).toExist();
            done();
          }, (error) => done(error));
      });
  });

  it(`should return ${HttpStatus.NOT_FOUND} if todo not found`, (done)=>{
    let unusedID = new ObjectID();

    request(app)
      .delete(`/todos/${unusedID}`)
      .set('x-auth', testUsers[1].tokens[0].token)
      .expect(HttpStatus.NOT_FOUND)
      .end(done);
  });

  it(`should return ${HttpStatus.NOT_FOUND} if object id is invalid`, (done)=>{
    let invalidID = 123;

    request(app)
      .delete(`/todos/${invalidID}`)
      .set('x-auth', testUsers[1].tokens[0].token)
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
      .set('x-auth', testUsers[0].tokens[0].token)
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

  it('should not update the todo created by another user', (done)=>{
    let id = testTodos[1]._id;
    let newText = 'Test patch update';

    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .send({
        text: newText,
        completed: true
      })
      .expect(HttpStatus.NOT_FOUND)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done)=>{
    let id = testTodos[1]._id;
    let newText = 'Test patch update 2';

    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', testUsers[1].tokens[0].token)
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
          })
          .catch((error) => done(error));
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

describe('POST /users/login', ()=>{
  it('should login user and return auth token', (done)=>{
    let testUser = testUsers[1];

    request(app)
      .post('/users/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(HttpStatus.OK)
      .expect((res)=>{
        expect(res.headers['x-auth']).toExist();
      })
      .end((error, res)=>{
        if(error) {
          return done(error);
        }

        User.findById(testUser._id)
          .then((user)=>{
            expect(user.tokens[1]).toInclude({
              access: 'auth',
              token: res.headers['x-auth']
            });
            done();
          })
          .catch((error) =>  done(error));
      });
  });

  it('should reject invalid login', (done)=>{
    let testUser = testUsers[1];
    let password = 'wrongPassword';

    request(app)
      .post('/users/login')
      .send({
        email: testUser.email,
        password: password
      })
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res)=>{
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((error, res)=>{
        if(error) {
          return done(error);
        }

        User.findById(testUser._id)
          .then((user)=>{
            expect(user.tokens.length).toBe(1);
            done();
          })
          .catch((error) =>  done(error));
      });
  });
});

describe('DELETE /users/me/token', ()=>{
  it('should remove auth token on logout', (done)=>{
    const user = testUsers[0];
    const token = user.tokens[0].token;

    request(app)
      .delete('/users/me/token')
      .set('x-auth', token)
      .expect(HttpStatus.OK)
      .end((err, res)=>{
        if(err) {
          return done(err);
        }

        User.findById(user._id)
          .then((user)=>{
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch((error) => done());        
      });
  });
});