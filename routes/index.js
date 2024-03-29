var express = require('express');
var router = express.Router();
var async = require('async');
var events = require('events');
//var sys = require('sys');
var meta = require('../apps/meta.js');

//passport
var passport = require('passport');
require('../apps/passport/passport_cfg.js')(passport);
var isLoggedIn = require('../apps/passport/isLoggedIn.js');

// sequelize
var db = require('../models');

// createPost
var createPost = require('../apps/createPost.js');

// globalJSON
var gJSON = require('../apps/globalJSON.js');

module.exports = router;

// Homepage
router.get('/', function(req, res) {
  //sys.puts(sys.inspect(req));

  var eventEmitter = new events.EventEmitter();

  //bind the final callback first
  eventEmitter.on('streamJSONDone', function thenRender(renderJSON) {
    res.render('index', { 
      title: meta.header(),
      isLoggedIn: isLoggedIn(req),
      gJSON: gJSON,
      p: gJSON.paths,
      renderJSON: renderJSON,
      streamType: true
    });

  });

  //now run callback dependents
  var streamJSON = require('../apps/stream/streamJSON.js')(req, eventEmitter);

});


//ME
router.get('/me', function(req, res) {
  //sys.puts(sys.inspect(req));

  var eventEmitter = new events.EventEmitter();

  //bind the final callback first
  eventEmitter.on('ownPostJSONDone', function thenRender(renderJSON) {
    res.render('index', { 
      title: meta.header(),
      isLoggedIn: isLoggedIn(req),
      gJSON: gJSON,
      p: gJSON.paths,
      renderJSON: renderJSON,
      streamType: 'ownPosts'
    });

  });

  //now run callback dependents
  var ownPostJSON = require('../apps/stream/ownPostJSON.js')(req, eventEmitter);

});

/* signup, LOGINS LOGOUTS */
router.get('/signup', function(req, res) {
  res.render('signup', { 
    title: meta.header(),
    gJSON: gJSON,
    p: gJSON.paths,
    message: req.flash('signupMessage'),
    
    //scripts required
    sValidator: true,
    sSignup: true
  });
});

router.post('/signup', 
  passport.authenticate('local-signup', {
    successRedirect : '/login', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  })
);

router.get('/login', function(req, res) {
  res.render('login', { 
    title: meta.header(),
    gJSON: gJSON,
    p: gJSON.paths,
    message: req.flash('loginMessage')
  });
});

router.post('/login', 
  passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  })
);


//ajax login. to be implemented soon...

// app.post('/login', function(req, res) {
//     console.log(res);
//     passport.authenticate('local', function(err, user) {
//       if (req.xhr) {
//         //thanks @jkevinburton
//         if (err)   { return res.json({ error: err.message }); }
//         if (!user) { return res.json({error : "Invalid Login"}); }
//         req.login(user, {}, function(err) {
//           if (err) { return res.json({error:err}); }
//           return res.json(
//             { user: {
//                       id: req.user.id,
//                       email: req.user.email,
//                       joined: req.user.joined
//               },
//               success: true
//             });
//         });
//       } else {
//         if (err)   { return res.redirect('/login'); }
//         if (!user) { return res.redirect('/login'); }
//         req.login(user, {}, function(err) {
//           if (err) { return res.redirect('/login'); }
//           return res.redirect('/');
//         });
//       }
//     })(req, res);
// });

router.get('/logout', function(req, res) {

  req.logout();
  res.redirect('/');

});

router.get('/post', function(req, res) {
  res.render('post', { 
    title: meta.header(),
    isLoggedIn: isLoggedIn(req),
    gJSON: gJSON,
    p: gJSON.paths
  });
});

  router.post('/post', function(req, res) {
    createPost(req, res);
  });


// router.get('/search', function(req, res) {
//   var eventEmitter = new events.EventEmitter();

//   //bind the final callback first
//   eventEmitter.on('searchUsersDone', function thenRender(renderJSON) {
//     res.render('search', { 
//       title: meta.header(),
//       isLoggedIn: isLoggedIn(req),
//       gJSON: gJSON,
//       p: gJSON.paths,
//       renderJSON: renderJSON,
//       streamType: 'search'
//     });

//   });

//   //now run callback dependents
//   var searchUsers = require('../apps/searchUsers.js')(req, eventEmitter);
// });

  router.post('/search', function(req, res) {
    var eventEmitter = new events.EventEmitter();

    //bind the final callback first
    eventEmitter.on('searchUsersDone', function thenRender(renderJSON) {
      res.render('search', { 
        title: meta.header(),
        isLoggedIn: isLoggedIn(req),
        gJSON: gJSON,
        p: gJSON.paths,
        renderJSON: renderJSON,
        streamType: false
      });

    });

    //now run callback dependents
    var searchUsers = require('../apps/searchUsers.js')(req, eventEmitter);
  });

router.post('/follow', function(req, res) {
  var follow = require('../apps/follow/follow.js');
  follow(req, res);
});

router.get('/following', function(req, res) {
  var follower = require('../apps/follow/follower.js');

    var eventEmitter = new events.EventEmitter();

    //bind the final callback first
    eventEmitter.on('followJSONDone', function thenRender(renderJSON) {
      res.render('search', { 
        title: meta.header(),
        isLoggedIn: isLoggedIn(req),
        gJSON: gJSON,
        p: gJSON.paths,
        renderJSON: renderJSON,
        streamType: false
      });

    });

    //now run callback dependents
    var follower = require('../apps/follow/follower.js')(req, eventEmitter, 'following');

});

router.get('/followers', function(req, res) {
  var follower = require('../apps/follow/follower.js');

    var eventEmitter = new events.EventEmitter();

    //bind the final callback first
    eventEmitter.on('followJSONDone', function thenRender(renderJSON) {
      res.render('search', { 
        title: meta.header(),
        isLoggedIn: isLoggedIn(req),
        gJSON: gJSON,
        p: gJSON.paths,
        renderJSON: renderJSON,
        streamType: false
      });

    });

    //now run callback dependents
    var follower = require('../apps/follow/follower.js')(req, eventEmitter, 'followers');

});

//user routes
router.get('/:user', function(req, res) {

  var eventEmitter = new events.EventEmitter();

  //bind the final callback first
  eventEmitter.on('profileJSONDone', function thenRender(renderJSON) {
    res.render('profile', { 
      title: meta.header(),
      isLoggedIn: isLoggedIn(req),
      gJSON: gJSON,
      p: gJSON.paths,
      renderJSON: renderJSON,
      streamType: false,
      userId: ( JSON.parse(renderJSON) ).userId
    });

  });

  //now run callback dependents
  var getProfile = require('../apps/getProfile.js')(req, eventEmitter);

});



///////////////////////////////////////////////////////

//dev routes
router.get('/dbtest', function(req, res) {
     
  db.sequelize.authenticate().complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err);
      res.send(err);
    } else {
      console.log('Connection has been established successfully.');
      res.send('Connection has been established successfully.');
    }
  });

});
router.get('/sync', function(req, res) {
  db.sequelize.sync({force:true}).on('success', function() {
    res.send('sync success');
  });
});