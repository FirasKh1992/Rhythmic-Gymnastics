const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
// const Post = require('../../models/Post');

const { validationResult, check } = require('express-validator');
//@route  GET api/profile/me
//@desc   get current user profile
//@aceess Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      'name'
    );

    if (!profile) {
      return res.status(400).send('there is no profile for this user');
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@route GET api/profile/user/:user_id
//@desc get profile by user_id
//@access  public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', 'name');
    if (!profile) {
      return res.status(400).send('Profile not found');
    }
    res.json(profile);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      //in case of passing anon valid object id its not an error on the server
      return res.status(400).send('Profile not found');
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'status is required').not().isEmpty(),
      check('skills', 'skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      location,
      bio,
      status,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      club,
    } = req.body;

    const profileFeilds = {};
    profileFeilds.user = req.user.id;
    if (location) profileFeilds.location = location;
    if (club) profileFeilds.club = club;
    if (bio) profileFeilds.bio = bio;
    if (status) profileFeilds.status = status;
    if (!Array.isArray(skills)) {
      profileFeilds.skills = skills.split(',').map(skill => skill.trim());
    }
    profileFeilds.social = {};
    if (youtube) profileFeilds.social.youtube = youtube;
    if (facebook) profileFeilds.social.facebook = facebook;
    if (twitter) profileFeilds.social.twitter = twitter;
    if (instagram) profileFeilds.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFeilds },
          { new: true }
        );
        return res.json(profile);
      }
      //create
      profile = new Profile(profileFeilds);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route GET api/profile/
//@desc get all profiles
//@access  public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', 'name');
    return res.json(profiles);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

// @route put api/profile/score/:tournament_id/:player_id
// @desc add score to player Profile tournaments
// @access  private
router.put('/score/:tournament_name/:player_mail', auth, async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.params.player_mail,
    });
    if (!user) {
      return res
        .status(500)
        .json({ errors: [{ msg: 'this user does not exists' }] });
    }
    const player = await Profile.findOne({ user: user._id }).populate(
      'user',
      'email'
    );
    if (!player) {
      return res
        .status(500)
        .json({ errors: [{ msg: 'this user had no profile yet.' }] });
    }

    Index = player.tournaments
      .map(item => item.eventName)
      .indexOf(req.params.tournament_name);
    const { dScore, eScore, ded, apparatus, total } = req.body;
    if (Index === -1) {
      return res
        .status(500)
        .json({
          errors: [
            {
              msg: `${req.params.player_mail} had not been added to ${req.params.tournament_name} event yet please contact the event creator`,
            },
          ],
        });
    }
    player.tournaments[Index].dScore = dScore;
    player.tournaments[Index].eScore = eScore;
    player.tournaments[Index].ded = ded;
    player.tournaments[Index].apparatus = apparatus;
    player.tournaments[Index].total = total;
    console.log(player);
    await player.save();

    res.json(player);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(`Server error ${err.message}`);
  }
});

module.exports = router;
