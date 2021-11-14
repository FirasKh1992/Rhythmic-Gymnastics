const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const Tournament = require('../../models/Tournament');
const User = require('../../models/User');

const { validationResult, check } = require('express-validator');

//@route GET api/tournament/
//@desc get all tournaments
//@access  public
router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    return res.json(tournaments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

//@route  GET api/tournament/:tournament_id
//@desc   get  tournament
//@aceess public
router.get('/:tournament_id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(
      req.params.tournament_id
    ).populate('profiles');
    if (!tournament) {
      return res.status(400).send('there is no such a tournaments');
    }

    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@route  GET api/tournament/name/:tournament_name
//@desc   get  tournament
//@aceess public
router.get('/name/:tournament_name', async (req, res) => {
  try {
    const tournament = await Tournament.findOne({
      eventName: req.params.tournament_name,
    }).populate({ path: 'profiles', populate: { path: 'user' } });
    if (!tournament) {
      return res.status(400).send('there is no such a tournaments');
    }

    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/tournament/
// @desc     Create tournament
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('year', 'year is required').not().isEmpty(),
      check('eventName', 'eventName is required').not().isEmpty(),
      check('country', 'country is required').not().isEmpty(),
      check('city', 'city is required').not().isEmpty(),
      check('category', 'category is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { year, eventName, country, city, category } = req.body;
    const tournamentFields = {};
    tournamentFields.year = year;
    tournamentFields.eventName = eventName;
    tournamentFields.country = country;
    tournamentFields.city = city;
    tournamentFields.creator = req.user.id;
    tournamentFields.category = category;
    tournamentFields.gymnastics = [];
    try {
      //create
      const existenceCheck = await Tournament.findOne({ eventName: eventName });
      if (existenceCheck) {
        return res.status(500).json({
          errors: [{ msg: 'tournament already exist,try another event name' }],
        });
      }
      let newTournament = new Tournament(tournamentFields);
      await newTournament.save();
      res.json(newTournament);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route DELETE api/tournament/:tournament_id
//@desc DELETE tournament
//@access  private
router.delete('/:tournament_id', auth, async (req, res) => {
  try {
    await Tournament.findOneAndDelete({ _id: req.params.tournament_id });

    res.json('tournament removed');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route POST  api/tournament/tournament/:player_id
// @desc add player to tournament tournaments
// @access  private
router.post('/:email/:event_name', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findOne({
      eventName: req.params.event_name,
    });
    if (!tournament) {
      return res.status(500).json({
        errors: [
          { msg: 'there is no such a tournament,try another event name' },
        ],
      });
    }
    const player = await User.findOne({
      email: req.params.email.toString(),
    });
    if (!player) {
      return res
        .status(500)
        .json({ errors: [{ msg: 'this user does not exists' }] });
    }
    const playerProfile = await Profile.findOne({ user: player._id }).populate(
      'user',
      'name'
    );
    if (!playerProfile) {
      return res
        .status(500)
        .json({ errors: [{ msg: 'this user had no profile yet.' }] });
    }
    playerProfile.tournaments.push(tournament);
    playerProfile.tournaments[playerProfile.tournaments.length - 1].playerName =
      playerProfile.user.name;

    tournament.profiles.push(playerProfile);
    await tournament.save();
    await playerProfile.save();
    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(`Server error ${err.message}`);
  }
});

// @route put api/tournament/tournaments/:tournament_id/:player_id
// @desc remove player from tournaments
// @access  private
router.put('/:tournament_id/:player_id', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournament_id);
    let removeIndex = tournament.gymnastics
      .map(item => item.id)
      .indexOf(req.params.player_id);
    tournament.gymnastics.splice(removeIndex, 1);
    const player = await Profile.findOne({
      user: req.params.player_id,
    }).populate('user', 'name');

    removeIndex = player.tournaments
      .map(item => item.id)
      .indexOf(req.params.tournament_id);

    player.tournaments.splice(removeIndex, 1);

    await player.save();
    await tournament.save();

    res.json(tournament);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(`Server error ${err.message}`);
  }
});

module.exports = router;
