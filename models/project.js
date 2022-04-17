//PROJECT
//Are visible representations of projects in the exhibition space
//Are assigned to user
//Hold metadata, administration data which can only be edited by admins and a JSON config for all visual aspects

const mongoose = require('mongoose');
const ProjectSchema  = new mongoose.Schema({
  admin: {
    type:String,
    required: false,
    default: ""
  },
  projectname:{
    type:String,
    required: true
  },
  visible:{
    type: Boolean,
    required: false,
    default: false
  },
  administration:{
    enabled:{ // will overwrite visiblity, can only be set by an admin
      type: Boolean,
      required: false,
      default: false
    },
    x:{ // x position can only be set by an admin
      type: Number,
      required: false,
      default: 0
    },
    y:{ // y position can only be set by an admin
      type: Number,
      required: false,
      default: 0
    },
  },
  metadata:{
    title:{ //description
      type: String,
      required: false,
      default: ""
    },
    path:{ //path to be used in achors etc
      type: String,
      required: false,
      default: ""
    },
    description:{ //description
      type: String,
      required: false,
      default: ""
    },
    artists:{ //artists line
      type: String,
      required: false,
      default: ""
    },
    date:{ //date line
      type: String,
      required: false,
      default: ""
    },
    link:{ //link for the button
      type: String,
      required: false,
      default: ""
    },
    linktitle:{ //title for the button
      type: String,
      required: false,
      default: ""
    }
  },
  config:{ //string based json storage for additional information
    type: String,
    required: false,
    default: '{type0:1,color0:"ffffff",type1:1,color1:"ffffff",type2:5,color2:"ffffff",type3:5,color3:"ffffff",type4:5,color4:"ffffff",type5:5,color5:"ffffff",type6:5,color6:"ffffff",type7:1,color7:"ffffff"}'
  }
})
const Project = mongoose.model('Project',ProjectSchema)
module.exports = Project
