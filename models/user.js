//USERS
//login with username and password
//save color and shape settings
//rights to admin and artist

const mongoose = require('mongoose');
const UserSchema  = new mongoose.Schema({
  username:{ //unique name
    type: String,
    required: true
  },
  password:{ //login password
      type  : String,
      required : true
  },
  admin:{ //flags if this project has admin rights
    type: Boolean,
    required: false,
    default: true
  },
  config:{ //string based json storage for additional information
    type: String,
    required: false,
    default: '{colorA:"ff0000",colorB:"0000ff"}'
  }
})
const User = mongoose.model('User',UserSchema)
module.exports = User
