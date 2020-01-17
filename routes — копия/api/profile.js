const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', [
      'name',
      'avatar',
    ]);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send('Server error');
  }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post(
  '/',
  [
    auth,
    check('status', 'Status is required')
      .not()
      .isEmpty(),
    check('skills', 'Skills is required')
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const {
    //   company,
    //   website,
    //   location,
    //   status,
    //   skills,
    //   bio,
    //   githubusername,
    //   youtube,
    //   twitter,
    //   facebook,
    //   linkedin,
    //   instagram,
    // } = req.body;

    // if (company) profileFields.company = company;
    // if (website) profileFields.website = website;
    // if (location) profileFields.location = location;
    // if (status) profileFields.status = status;
    // if (githubusername) profileFields.githubusername = githubusername;

    const profileFields = {
      user: req.user.id,
      company: req.body.company,
      website: req.body.website,
      location: req.body.location,
      status: req.body.status,
      githubusername: req.body.githubusername,
      skills: req.body.skills.split(',').map((skill) => skill.trim()),
      social: {
        youtube: req.body.youtube,
        twitter: req.body.twitter,
        facebook: req.body.facebook,
        linkedin: req.body.linkedin,
        instagram: req.body.instagram,
      },
    };

    console.log(profileFields.skills);
    // if (req.body.skills) {
    //   profileFields.skills = skills.split(',').map((skill) => skill.trim());
    // }

    // profileFields.social;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      profile = new Profile(profileFields);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
  }
);

module.exports = router;
