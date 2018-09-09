var express    = require('express');
var Location  = require('../models/location');
var LocRating = require('../models/loc_rating');
var LocationView = require('../models/location_views');
var User = require('../models/user');
var router 	   = express.Router();
var fs = require('fs');
var validator = require('../additional_functions/validator');
var Busboy = require('busboy');
var geoip = require('geoip-lite');
var getDistance = require('../additional_functions/calc_distance');
var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google'
};

var geocoder = NodeGeocoder(options);
/* GENERATOR */
router.post('/generate_likes', function(req,res) {
    User.find(function(err,users) {
        if (err)
            res.status(500).send({ error: err });
        else {
            Location.find(function(err,locs) {
                if (err)
                    res.status(500).send({ error: err });
                else {
                    locs.map((loc) => {
                        for (var i=0;i<25;i++) {
                            var rnd_usr = parseInt(Math.random() * (users.length-1));
                            var loc_rtn = new LocRating();
                            loc_rtn.user  = users[rnd_usr]._id;
                            loc_rtn.location = loc._id;
                            loc_rtn.rating = parseInt(Math.random() * 10);
                            loc_rtn.save(function(err) {
                                if(err)
                                    res.status(500).send({error:err});
                            });
                        }
                    });
                }
            });
        }
    });
});
/* GENERATOR */



//add location
router.post('/', function(req, res) {
    if(req.session.user==null){
        res.status(500).send({ error: "User not logged in!"});
    }
    else if (req.session.user.type=='admin') {
        var loc=new Location();
        var data = {};
        data.pictures=[];
        var cnt = 1;
        var busboy = new Busboy({ headers: req.headers });
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) { // IMAGE
            var path = "server/images/"+loc._id + "_pic_" + cnt+"."+mimetype.split('/')[1];
            data.pictures.push('http://localhost:8080/'+path);
            cnt++;
            file.pipe(fs.createWriteStream(path));
        }); // FIELDS
        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
            data[fieldname] = val;
        });
        busboy.on('finish', function() {
            var valid = validator({
                city: {type:"string", required:true},
                description: {type:"string", required:true},
                country: {type:"string", required:true}
            }, data);

            if (valid != '') { // INVALID
                res.status(500).send({ error: valid });
            } else { // VALID
                Object.keys(data).map((key)=> {
                    loc[key] = data[key];
                });

                geocoder.geocode(loc.city+" "+loc.country, function(err, pos) {
                    if (err)
                        console.log("err");
                    else {
                        loc.latitude = pos[0].latitude;
                        loc.longitude = pos[0].longitude;
                        loc.save(function (err, r) {
                            if (err)
                                res.status(500).send({error: err});
                            else {
                                res.json(r);
                                return;
                            }
                        });
                    }
                });

            }
        });
        req.pipe(busboy);
    }
    else if (req.session.user.type=='regular') {
        res.status(500).send({ error: "Current user doesn't have permission for this action!"});
    }
});

// update location
router.put('/:id', function(req, res) {
    if(req.session.user==null){
        res.status(500).send({ error: "User not logged in!"});
    }
    else if (req.session.user.type=='admin') {
        Location.findById(req.params.id, function(err, loc) {
            if (err) {
                res.status(500).send({error: err});
            }
            else if (!loc) {
                res.status(500).send({error: "Location doesn't exist"});
            } 
            else {
                var data = {};
                data.pictures=[];
                var cnt = 1;
                var busboy = new Busboy({ headers: req.headers });
                busboy.on('file', function(fieldname, file, filename, encoding, mimetype) { // IMAGE
                    var path = "server/images/"+loc._id + "_pic_" + cnt+"."+mimetype.split('/')[1];
                    data.pictures.push('http://localhost:8080/'+path);
                    cnt++;
                    file.pipe(fs.createWriteStream(path));
                }); // FIELDS
                busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
                    data[fieldname] = val;
                });
                busboy.on('finish', function() {
                    var valid = validator({
                        city: {type:"string", required:true},
                        description: {type:"string", required:true},
                        country: {type:"string", required:true}
                    }, data);

                    if (valid != "") { // INVALID
                        res.status(500).send({ error: valid });
                    } else { // VALID
                        Object.keys(data).map((key)=> {
                            if ((key == "pictures" && data[key].length > 0) || key != "pictures")
                                loc[key] = data[key];
                        });

                        loc.save(function (err, r) {
                            if (err)
                                res.status(500).send({error: err});
                            else
                                res.json(r);
                        });
                    }
                });
                req.pipe(busboy);   
            }
        });
    }
    else if (req.session.user.type=="regular") {
        res.status(500).send({ error: "Current user doesn't have permission for this action!"});
    }
});


/* RESET LOCATIONS RATING */
router.post('/reset_rating', function(req,res) {
   Location.find(function(err,locs){
      if (err)
          res.status(500).send({error:err});
      else {
          locs.map((loc)=> {
             loc.rating = parseFloat(parseInt(loc.score)/parseInt(loc.votes)).toFixed(1);
             loc.save(function(err){
                 if (err)
                     res.status(500).send({error:err});
             });
          });
      }
   });
});

/* RESET LOCATIONS RATING */

// update rating
router.put('/rating/:id', function(req, res) {
    if(req.session.user==null){
        res.status(500).send({ error: "User not logged in!"});
    }
    else {
        Location.findById(req.params.id, function(err, loc) {
            if (err) {
                res.status(500).send({error: err});
            }
            else if (!loc) {
                res.status(500).send({error: "Location doesn't exist"});
            } else {
                var data = req.body;
                var valid = validator({
                    rating: {type:"number", required:true}
                }, data);

                if (valid != "") { // INVALID
                    res.status(500).send({ error: valid });
                } else { // VALID
                    LocRating.findOne({user:req.session.user._id, location:req.params.id}, function (err, rtng) {
                        if (err)
                            res.status(500).send({error: err});
                        else if (rtng==null) { // first time rating the location
                            loc.score += data.rating;
                            loc.votes += 1;
                            loc.rating = parseFloat(loc.score/loc.votes).toFixed(1);

                            rtng = new LocRating();
                            rtng.user = req.session.user._id;
                            rtng.location = req.params.id;
                            rtng.rating = data.rating;

                            rtng.save(function(err) {
                               if (err)
                                   res.status(500).send({error: err});
                               else {
                                   loc.save(function (err, r) {
                                       if (err)
                                           res.status(500).send({error: err});
                                       else
                                           res.json(r);
                                   });
                               }
                            });
                        } else { // has already rated, CHANGE users rating adequately
                            loc.score += data.rating - rtng.rating;
                            loc.rating = parseFloat(loc.score/loc.votes).toFixed(1);

                            loc.save(function (err, r) {
                                if (err)
                                    res.status(500).send({error: err});
                                else
                                    res.json(r);
                            });
                        }
                    });
                }
            }
        });
    }
});

// increment VIEWS
router.put('/views/:id', function (req,res) {
    Location.findById(req.params.id, function (err, loc) {
        if (err)
            res.status(500).send({error: err});
        else if (!loc)
            res.status(500).send({error: err});
        else {
            var view = new LocationView();
            view.location = req.params.id;

            view.save(function(err,r) {
                if (err)
                    res.status(500).send({error: err});
                else
                    res.json(r);
            });
        }
    });
});

// add comment
router.put('/comment/:id', function(req, res) {
    if(req.session.user==null){
        res.status(500).send({ error: "User not logged in!"});
    }
    else {
        Location.findById(req.params.id, function(err, loc) {
            if (err) {
                res.status(500).send({error:err});
            }
            else if (!loc) {
                res.status(500).send({error: "Location doesn't exist"});
            }
            else {
                var data = req.body;
                data.user_id = req.session.user._id;
                var valid = validator({
                    comment: {type:"string", required:true}
                }, data);

                if (valid != "") { // INVALID
                    res.status(500).send({ error: valid });
                } else { // VALID
                    loc.comments.push(data);
                    loc.save(function (err, l) {
                        if (err)
                            res.status(500).send({error: err});
                        else
                            res.json(l);
                    });
                }
            }
        });
    }
});
// delete comment
router.put('/delete_comment/:id', function(req, res) {
        if (req.session.user == null) {
            res.status(500).send({error: "User not logged in!"});
        }
        else {
            Location.findById(req.params.id, function (err, loc) {
                if (err) {
                    res.status(500).send({error: err});
                }
                else if (!loc) {
                    res.status(500).send({error: "Location doesn't exist"});
                }
                else {
                    var data = req.body;
                    data.user_id = req.session.user._id;
                    var valid = validator({
                        comment_id: {type: "string", required: true}
                    }, data);

                    if (valid != "") { // INVALID
                        res.status(500).send({error: valid});
                    } else { // VALID
                        var cms = [];
                        var x = true;
                        loc.comments.map((row) => {
                            if (data.comment_id == row._id && data.user_id != row.user_id) {
                                x = false;
                            }
                            else if (data.comment_id != row._id) {
                                cms.push(row);
                            }
                        });

                        if (x) {
                            loc.comments = cms;
                            loc.save(function (err, l) {
                                if (err)
                                    res.status(500).send({error: err});
                                else
                                    res.json(l);
                            });
                        } else {
                            res.status(500).send({error: "Current user doesnt't have permission for this action"});
                        }
                    }
                }
            });
        }
});

// return all locations
router.get('/', function(req, res) {
    var find  = {};
    var sort={};
    var limit=0;
    if (req.query.search) {
        find = { "$text": { "$search":  req.query.search}},{ fscore: { $meta: "textScore" }};
    }
    if (req.query.sort) {
        if (req.query.sort=="city")
            sort = {city:1};
        else if (req.query.sort=="rating")
            sort = {rating: -1};
    }
    if (req.query.limit) {
        limit = parseInt(req.query.limit);
    }
    Location.find(find).sort(sort).limit(limit).exec(function (err, l) {
        if (err)
            res.status(500).send({error: err});
        else {
            res.json(l);
        }
    });
});
// return locations by user's geolocation
router.get('/geo', function (req,res) {
    if (req.query.lat && req.query.lon) {
        Location.find(function (err, l) {
            if (err)
                res.status(500).send({error: err});
            else {
                var max = 350; // kilometres
                if (req.query.max) {
                    max = parseInt(req.query.max);
                }
                var arr=[];
                l.map((row) => {
                    var distance = getDistance(req.query.lat, req.query.lon, row.latitude, row.longitude);
                    if (distance<max) {
                        arr.push(row);
                    }
                });
                res.json(arr);
            }
        });
    } else {
        res.status(500).send({error: "No coordinates given!"});
    }
});
// return locations by geolocation
router.get('/geo/:id', function (req,res) {
    Location.findById(req.params.id, function (err, loc) {
        if (err)
            res.status(500).send({error: err});
        else if (!loc)
            res.status(500).send({error: "Location doesn't exist"});
        else {
            Location.find(function (err, l) {
                if (err)
                    res.status(500).send({error: err});
                else {
                    var max = 600; // kilometres
                    if (req.query.max) {
                        max = parseInt(req.query.max);
                    }
                    var arr=[];
                    l.map((row) => {
                        var distance = getDistance(loc.latitude, loc.longitude, row.latitude, row.longitude);
                        if (distance<max) {
                            arr.push(row);
                        }
                    });
                    res.json(arr);
                }
            });
        }
    });
});
// return user RATING
router.get('/votes/:id', function(req, res) {
    if (req.session.user!=null) {
        LocRating.findOne({user:req.session.user._id,location:req.params.id}, function(err, rtn) {
            if (err)
                res.status(500).send({error: err});
            else if (!rtn)
                res.json({});
            else
                res.json({rating: rtn.rating});
        });
    } else {
        res.json({msg:"User not logged in"});
    }
});
// return single location
router.get('/:id', function(req, res) {
    Location.findById(req.params.id, function(err, l) {
        if (err)
            res.status(500).send({error: err});
        else if (!l)
            res.status(500).send({error: "Location doesn't exist"});
        else
            res.json(l);
    });
});

// delete location
router.delete('/:id', function(req, res) {
    if(req.session.user==null){
        res.status(500).send({ error: "User not logged in!"});
    }
    else if (req.session.user.type=="admin") {
        Location.findById({_id: req.params.id}).exec(function (err, l) {
            if (err)
                res.status(500).send({error: err});
            else if (!l) {
                res.status(500).send({error: "Location doesn't exist"});
            }
            else {
                l.remove(function (err) {
                    if (err)
                        res.status(500).send({error: err});
                    else
                        res.json({msg: "OK"});
                });
            }
        });
    }
    else {
        res.status(500).send({ error: "Current user doesn't have permission for this action!"});
    }
});

module.exports=router;