const mongoose = require('mongoose');
const Tournament = require('./Tournament');
const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
  },
  social: {
    youtube: {
      type: String,
    },
    twitter: {
      type: String,
    },
    facebook: {
      type: String,
    },
    instagram: {
      type: String,
    },
  },
  skills: {
    type: [String],
    required: true,
  },
  club: {
    type: String,
  },
  country: {
    type: String,
  },
  tournaments: [
    {
      category: {
        type: String,
      },
      dScore: {
        type: Number,
        default: 0,
      },
      eScore: {
        type: Number,
        default: 0,
      },
      eventName: {
        type: String,
      },
      city: {
        type: String,
      },
      country: {
        type: String,
      },
      playerName:{
        type:String,
      },
      apparatus:{
        type:String,
      },
      ded:{
        type:Number,
        default:0
      },
      total:{
        type:Number,
        default:0
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = profile = mongoose.model('profile', ProfileSchema);
