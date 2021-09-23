const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt=require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config=require('config');

//@route post api/users
//@desc Register User
//@access  public
router.post(
  '/',
  [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'please include a valid email').isEmail(),
    check(
      'password',
      'please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { name, email, password } = req.body;
    try {
      //see if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'user already exist' }] });
      }

      user = new User({
          name,
          email,
          password
      })

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password,salt);
      await user.save();
   
      //Encrypt  password
      //return jsonwebtoken and that in order to keep the user logged in after the registeration.

      const payload={
          user:{
              id:user.id
          }
      }
      jwt.sign(
          payload,
          config.get('jwtSecret'),
          {expiresIn:3600000},
          (err,token)=>{
              if(err) throw err;
              res.json({token});
          })
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
