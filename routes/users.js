var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');
var jwtSecret = require('../jwtConfig');
var util = require('../util.js');
var bodyParser = require('body-parser');
var jwtPassport = require('../jwtPassport');
const mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const format = require('util').format;

const BCRYPT_SALT_ROUNDS = 12;

/**
 * @apiDefine DFHeader @apiVersion 0.1.0
 * @apiHeader (Digital Factory header) {String} Content-Type application/json
 * @apiHeader (Digital Factory header) {String} Authorization Users JWT token Ex.: JWT <token>
 * @apiHeaderExample {json} Header-example
 *  {
 *      "Content-Type" : "application/json",
 *      "Authorization": "JWT <token>",
 *  }
 *
*/



/**
 * @api {get} /users/all GET all users
 * @apiName GetAllUsers
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Authentication
 * 
 * @apiSuccess {Object[]} users Returns all the user documents.
 */
router.get('/all', jwtPassport.isAuthorized, async function(req, res, next) {
  try {
    // Add user roles to this
    var foundData = await util.getModel()["Users"]["authUser"].find('query' in req ? req.query : {}, "-secret")
    .populate([{path: 'roles'}]);
    res.json(foundData);
  } catch (e) {
    util.reportMessage(e, format(
      "E80: Error during retrieval of users.",
      null), null, res);
  }
});

/**
 * @api {get} /users/roles GET all roles
 * @apiName GetUserRoles
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Authentication
 * 
 * @apiSuccess {Object[]} roles Returns all the role documents.
 */
router.get('/roles', jwtPassport.isAuthorized, async function(req, res, next) {
  try {
    var foundData = await util.getModel()["Users"]["authRole"].find('query' in req ? req.query : {});
    res.json(foundData);
  } catch (e) {
    util.reportMessage(e, format(
      "E80: Error during retrieval of users.",
      null), null, res);
  }
});

/**
 * @api {post} /users/register POST Register a new user
 * @apiName PostRegisterUser
 * @apiGroup Authentication
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiParam {String} username Username for the new user. Must be unique.
 * @apiParam {String} password Password for the new user.
 * @apiParam {String} firstName First name for the new user.
 * @apiParam {String} lastName Last name for the new user.
 * @apiParam {String} [email] Email address for the new user.
 * @apiParam {String} [phone] Phone numbers for the new user.
 * @apiParam {ObjectId[]} roles Array of roles for the new user.
 * 
 * @apiSuccess {Boolean} success Returns true if user has been created.
 * @apiSuccess {String} message Information on user creation.
 */
router.post('/register', jwtPassport.isAuthorized, async function(req, res, next) {
  console.log(req.session);
  try{
    console.log("Resgistering user with " + req.body.username + " and " + req.body.password)
    // Look up in the database to see if username exists
    var user = await util.getModel()["Users"]["authUser"].findOne({uuid: req.body.username});
    if(user != undefined){
        console.log('User has already been created.');
        res.json({success: false, message: 'User has already been created.'});
    } else {
      console.log("Did not find user! Making a new one...");
        bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS).then(async function(hashedPassword) {
          console.log(hashedPassword);
            // This is where the new user is created, new doc in authUsers & authSecrets. Assign low level role from authRoles
            var userId = new mongoose.mongo.ObjectId();
            var secretId = new mongoose.mongo.ObjectId();
            var userDoc ={
              _id: userId, 
              name: req.body.username, 
              uuid: req.body.username, 
              firstName: req.body.firstName, 
              lastName: req.body.lastName,
              displayName: req.body.firstName + ' ' + req.body.lastName,
              email: req.body.email,
              phone: req.body.phone,
              secret: secretId,
              roles: [], 
              active: true
            }
            var rolesIds = [];
            req.body.roles.forEach(function(item) {
              rolesIds.push(new mongoose.mongo.ObjectId(item));
            })
            userDoc.roles = rolesIds;
            var newUser = new (util.getModel()["Users"]["authUser"])(userDoc);
            newUser.docProperties = await util.createDocProperties(req.userId);
            var savedUser = await newUser.save();
            console.log(savedUser._doc);
            var newSecret = new (util.getModel()["Users"]["authSecret"])({_id: secretId, secretType: "pwd", secret: hashedPassword, 
            createdBy: "API", createdDate: new Date(), lastModifiedBy: "API", lastModifiedDate: new Date()});
            var savedSecret = await newSecret.save();
            console.log("Created user and secret");
            res.json({success:true, message: "User " + savedUser._doc.name + " has successfully been created."});
        }, function(err) {console.log(err)});
    }
  } catch (e) {
    //util.reportMessage(e, format("E81: Error during creation of new user.", null), null, res);
  }
});

/**
 * @api {get} /users/login GET Login user
 * @apiName GetUserLogin
 * @apiVersion 0.1.0
 * @apiGroup Authentication
 * @apiParam Active JWT token
 * @apiDeprecated Use now (#Authentication:PostLogin)
 */
router.get('/login', passport.authenticate('login'), async function(req, res, next) {
    console.log(req);
    req.logIn(req.user, async function(){
      var newuser = await util.getModel()["Users"]["authUser"].findById(req.session.passport.user)
      .populate([{path: 'roles', select: ['_id', 'uuid', 'displayName']}]);
      //console.log(newuser);
      if(newuser != null){
        // Get the uuids for the user's roles
/*         var item = newuser.ref.find( function(element){
          return element.collection == "authRoles";
        }) */
        var roles = [];
        for(let i = 0; i < newuser.roles.length; i++){
          roles.push(newuser.roles[i]._id);
        }
        /* newuser.roles.forEach(r =>{
          roles.push(r._id);
        })  */
        const token = jwt.sign({id: newuser.uuid, roles: roles}, jwtSecret.secret, {expiresIn: '3d'});
        //console.log(token);
        let info = {
          auth: true,
          message: 'User logged in.',
          user: {
            token: token,
            username: newuser.uuid,
            firstName: newuser.firstName,
            lastName: newuser.lastName,
            id: newuser._id,
            roles: newuser.roles
          }
        }
        res.send(info);
      }
    })
    });

/**
 * @api {post} /users/login POST Login user
 * @apiName PostLogin
 * @apiVersion 0.1.0
 * @apiGroup Authentication
 * @apiParam {String} username Username
 * @apiParam {String} password Password
 * @apiSuccess {Boolean} auth Returns true if user is logged in.
 * @apiSuccess {String} message Information on user logging in.
 * @apiSuccess {Object} user Object that contain the JWT and other information.
 * @apiSuccess {String} user.token The JWT for the user. Expires after 3 days.
 * @apiSuccess {String} user.username The username of the user.
 * @apiSuccess {String} user.firstName The firstname of the user.
 * @apiSuccess {String} user.lastName The lastname of the user.
 * @apiSuccess {ObjectId} user.id The MongoId of the user.
 * @apiSuccess {ObjectId[]} user.roles An array of MongoIds for the user's roles.
 * 
 */
//router.post('/login', async function(req, res, next) {
router.post('/login', passport.authenticate('login'), async function(req, res, next) {
    req.logIn(req.user, async function(){
      var newuser = await util.getModel()["Users"]["authUser"].findById(req.session.passport.user)
      .populate([{path: 'roles', select: ['_id', 'uuid', 'displayName']}]);
      //console.log(`Looking for user .... ${newuser}`);

      if(newuser != null){
        // Get the uuids for the user's roles
/*         var item = newuser.ref.find( function(element){
          return element.collection == "authRoles";
        }) */
        var roles = [];
        for(let i = 0; i < newuser.roles.length; i++){
          roles.push(newuser.roles[i]._id);
        }
        /* newuser.roles.forEach(r =>{
          roles.push(r._id);
        })  */
        const token = jwt.sign({id: newuser.uuid, roles: roles}, jwtSecret.secret, {expiresIn: '3d'});
        //console.log(token);
        let info = {
          auth: true,
          message: 'User logged in.',
          user: {
            token: token,
            username: newuser.uuid,
            firstName: newuser.firstName,
            lastName: newuser.lastName,
            id: newuser._id,
            roles: newuser.roles
          }
        }
        res.send(info);
      }
    })
  });

/**
 * @api {put} /users/changePsw PUT Change password
 * @apiName PutChangePsw
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Authentication
 * 
 * @apiParam {String} user The username of the user requesting to change their password.
 * @apiParam {String} old The old password of the user.
 * @apiParam {String} new The new password for the user.
 * 
 * @apiSuccess {String} message Returns "Updated password." 
 * @apiSuccess {Boolean} success Return true.
 */
router.put('/changePsw', jwtPassport.isAuthorized, async function(req, res, next) {
  try {
    var foundUser = await util.getModel()["Users"]["authUser"].findOne({uuid: req.body.user});
    //console.log(`Found USER____>:${foundUser}`);
    if(foundUser != undefined)
    {
      var item = foundUser.secret;
      //console.log(foundUser.secret);
      var foundSecret = await util.getModel()["Users"]["authSecret"].findById(item);
      if(foundSecret != undefined)
      {
        var oldPwd = foundSecret.secret;
        bcrypt.compare(req.body.old, oldPwd).then(response => {
          if(!response) res.json({message: "Incorrect password.", success: false})
          else if(response) {
            bcrypt.hash(req.body.new, BCRYPT_SALT_ROUNDS).then(async function(hashedPassword) {
              await util.getModel()["Users"]["authSecret"].findByIdAndUpdate(foundSecret, 
               {$set: {secret: hashedPassword}, $push: {previousSecrets: oldPwd}});
               res.json({message: "Updated password.", success: true})
           })
          }
        })
      } else {
        res.json({message: "Could not find secret.", success: false})
      }
    } else {
      res.json({message: "Could not find user.", success: false})
    }
  } catch (e) {

  }
})

/**
 * @api {put} /users/edit PUT Edit user
 * @apiName PUT Edit user
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Authentication
 *
 * @apiParam {ObjectId} updatedUserId MongoId of the user being updated.
 * @apiParam {String} [new] New password for the user being updated.
 * 
 * @apiParam {Object} update Object that contains all the fields to be updated.
 * @apiParam {String} update.name Username of the user being updated. Must be unique.
 * @apiParam {String} update.firstName First name for the user being updated.
 * @apiParam {String} update.lastName Last name for the user being updated.
 * @apiParam {String} update.email Email address for the user being updated.
 * @apiParam {String} update.phone Phone numbers for the user being updated.
 * @apiParam {ObjectId[]} update roles Array of roles for the user being updated.
 * 
 * @apiSuccess {Boolean} success Returns true if user has been updated
 * @apiSuccess {String} message Information on user edit.
 * @apiSuccess {Object} User Updated user document.
 */
router.put('/edit', jwtPassport.isAuthorized, async function(req, res, next) {
  try {
    var foundUser = await util.getModel()["Users"]["authUser"].findById(req.body.updatedUserId);
    //console.log(foundUser);
    if(foundUser != undefined)
    {
      var userSecret = foundUser.secret;
      //console.log(userSecret)
      var foundSecret = await util.getModel()["Users"]["authSecret"].findById(userSecret);
      //console.log(foundSecret);
      if(foundSecret != undefined)
      {
        //console.log(req.body.update)
        var update = req.body.update;
        var rolesIds = [];
        update.roles.forEach(function(item) {
              rolesIds.push(new mongoose.mongo.ObjectId(item));
            })

        updatedUser = await util.getModel()["Users"]["authUser"].findByIdAndUpdate(req.body.updatedUserId,
          {$set: {firstName: update.firstName, lastName: update.lastName, displayName: update.firstName + ' ' + update.lastName,
          email: update.email, phone: update.phone, name: update.name, uuid: update.name, secret: userSecret, roles: rolesIds}});

        console.log(req.body.new);

        if(req.body.new != "" && req.body.new != undefined)
        {
          bcrypt.hash(req.body.new, BCRYPT_SALT_ROUNDS).then(async function(hashedPassword) {
            var oldPwd = foundSecret._doc.secret;
            await util.getModel()["Users"]["authSecret"].findByIdAndUpdate(foundSecret._id, 
              {$set: {secret: hashedPassword}, $push: {previousSecrets: oldPwd}});
          })
        }

        res.json({message: "Updated User.", User: updatedUser._doc, success: true})
      } else {
        res.json({message: "Could not find secret.", success: false})
      }
    } else {
      res.json({message: "Could not find user.", success: false})
    }
  } catch (e) {

  }
})

/**
 * @api {put} /users/longlivetoken PUT Retrieve a long live token for an agent.
 * @apiName PUT Long Live Token
 * @apiDescription This end point is used to retrieve a long lived token for a data agent.
 * One the website, a user can navigate to the "Data Agent Token" page. Once there, they can select the data agent from a list then get its token.
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Authentication
 *
 * @apiParam {ObjectId} agentId MongoId of the agent the long live token is for.
 * 
 * @apiSuccess {Boolean} auth Returns true if the agent has been found and the user is authorized.
 * @apiSuccess {String} message "Retrieved long live token."
 * @apiSuccess {String} token Token for the agent.
 */
router.put('/longlivetoken', jwtPassport.isAuthorized, async function(req, res, next){
  console.log(`Got to longlivetoken!`);

   try{
    var agent = await util.getModel()["Users"]["authUser"].findById(req.body.agentId);
    console.log(`Got agent request ${agent}`);
    if(agent != null){
      const token = jwt.sign({id: agent.uuid, roles: agent.roles}, jwtSecret.secret);
      console.log(`Got token ${token}`);
      res.status(200).send({
        auth: true,
        message: 'Retrieved long live token.',
        token: token
      })
    }
   } catch (e) {

   }
})

/**
 * @api {put} /users/authorizations PUT Set the array of authorizations on a role.
 * @apiName PUT Role authorizations
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Authentication
 * @apiPrivate
 *
 * @apiParam {ObjectId} role MongoId of the role.
 * @apiParam {ObjectId[]} auths Array of MongoIds for all the endpoints the role has authorization for.
 * 
 * @apiSuccess {Boolean} success Returns true if the role has been updated.
 * @apiSuccess {String} message "Updated Role successfully."
 */
router.put('/authorizations', jwtPassport.isAuthorized, async function(req, res, next) {
  try {
    var roleId = req.body.role;
    var auths = [];

    req.body.auths.forEach(function(item) {
      //console.log(item);
      auths.push(new mongoose.mongo.ObjectId(item));
    })

    //console.log(auths);
    var updatedRole = await util.getModel()["Users"]["authRole"].findByIdAndUpdate(roleId, {authorizations: auths});
    //console.log(updatedRole);

    res.json({message: "Updated Role successfully.", success: true});
    

  } catch (e) {
     
  }
})

/**
 * @api {put} /users/authorizations/aa PUT Add to the array of authorizations on a role.
 * @apiName PUT Role add authorizations
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Authentication
 * @apiPrivate
 *
 * @apiParam {ObjectId} role MongoId of the role.
 * @apiParam {ObjectId[]} auths Array of MongoIds for new endpoints the role has authorization for.
 * 
 * @apiSuccess {Boolean} success Returns true if the role has been updated.
 * @apiSuccess {String} message "Updated Role successfully."
 */
router.put('/authorizations/add', jwtPassport.isAuthorized, async function(req, res, next) {
  try {
    var roleId = req.body.role;
    var auths = [];

    req.body.auths.forEach(function(item) {
      //console.log(item);
      auths.push(new mongoose.mongo.ObjectId(item));
    })

    //console.log(auths);
    var updatedRole = await util.getModel()["Users"]["authRole"].findByIdAndUpdate(roleId, {$push: {authorizations: auths}});
    //console.log(updatedRole);

    res.json({message: "Updated Role successfully.", success: true});
    

  } catch (e) {
     
  }
})


module.exports = router;
