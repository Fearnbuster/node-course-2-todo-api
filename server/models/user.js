

// Created: May 4, 2018

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const mongoose = require('mongoose');
const validator = require('validator');


let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },

  password: {
    type: String,
    require: true,
    minlength: 6
  },

  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.pre('save', function(next){
  let user = this;

  if(user.isModified('password')) {
    bcrypt.genSalt(10)
      .then((salt)=>{
        return bcrypt.hash(user.password, salt);
      })
      .then((hashedPassword)=>{
        user.password = hashedPassword;
        next();
      })
      .catch((error)=>{
        next();
      });
  }
  else {
    next();
  }
});

UserSchema.statics.findByCredentials = function(email, password){
  let User = this;

  return User.findOne({email})
    .then((user)=>{
      if(!user) {
        return Promise.reject();
      }
        
      return bcrypt.compare(password, user.password)
        .then((isMatch)=>{
          if(isMatch) {
            return Promise.resolve(user);
          }
          else {
            return Promise.reject('Credentials incorrect');
          }
        });
    });
};

UserSchema.statics.findByToken = function(token){
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  }
  catch (error) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.methods.toJSON = function(){
  let user = this;
  let userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function(){
  let user = this;
  let access = 'auth';
  let token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens = user.tokens.concat([{ access, token }]);

  return user.save()
    .then(()=>{
      return token;
    });
};

UserSchema.methods.removeToken = function(token){
  let user = this;

  return user.update({
    $pull: {
      tokens: { token }
    }
  });
};

let User = mongoose.model('User', UserSchema);


module.exports = {
  User
};