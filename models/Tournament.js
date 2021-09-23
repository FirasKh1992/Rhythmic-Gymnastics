const mongoose = require('mongoose');
const Profile = require('./Profile')
const TournamentSchema = new mongoose.Schema({
  creator:{
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    default: null,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  eventName: {
    type: String,
    required: true,
    unique:true
  },
  year:{
    type: String,
    required: true,
  },
  category:{
    type: String,
    required:true

  },
  date: {
    type: Date,
    default: Date.now
  },
  profiles: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profile',
    }
]
});

module.exports = Tournament = mongoose.model('tournament', TournamentSchema);
