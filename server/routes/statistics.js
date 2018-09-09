var express    = require('express');
var router = express.Router();
var app = express();
require('run-middleware')(app);
var Review=require('../models/review');
var Rating=require('../models/rating');
var StoryViews = require('../models/story_views');
var Location = require('../models/location');
var LocationViews = require('../models/location_views');
var User = require('../models/user');
var mongoose = require('mongoose');
var moment = require('moment');

/* VIEWS GENERATOR */
router.post('/generate_stories_views', function(req,res){
    Review.find({rating: {$gte: 3}}).limit(12).exec(function(err,revs) {
        if (err) {
            res.status(500).send({error:err});
        } else {
            var dates = getDates(new Date('05/20/2017'), new Date('06/10/2017'));

            dates.map((date)=> {
                revs.map((rev)=> {
                    var rnd = Math.random() * 40;
                    for (var i=0; i<=rnd;i++){
                        var view = new StoryViews();
                        view.review = rev._id;
                        view.date_added = new Date(date+' 2017');
                        view.save(function(err) {
                            if(err) {
                                res.status(500).send({error:err});
                            }
                        });
                    }
                });
            });
        }
    });
});
router.post('/generate_location_views', function(req,res){
    Location.find({rating: {$gte: 6.5}}).limit(12).exec(function(err,locs) {
        if (err) {
            res.status(500).send({error:err});
        } else {
            var dates = getDates(new Date('05/20/2017'), new Date('06/10/2017'));

            dates.map((date)=> {
                locs.map((loc)=> {
                    var rnd = Math.random() * 40;
                    for (var i=0; i<=rnd;i++){
                        var view = new LocationViews();
                        view.location = loc._id;
                        view.date_added = new Date(date+' 2017');
                        view.save(function(err) {
                            if(err) {
                                res.status(500).send({error:err});
                            }
                        });
                    }
                });
            });
        }
    });
});
/* VIEWS GENERATOR */

router.get('/stories_per_user', function(req,res) {
    if (req.session.user==null) {
        res.status(500).send({error:"User not logged in"});
    } else if (req.session.user.type === 'admin') {
        if (!req.query.fromDate || !req.query.toDate) {
            res.status(500).send({error: "No datespan given"});
        } else {
            var from = req.query.fromDate;
            var to = req.query.toDate;
            var dates = getDates(from,to);
            Review.find({date_added: {$gte: from, $lte: to}}).exec(function(err,revs) {
                if (err)
                    res.status(500).send({error:err});
                else {
                    var usr_arr=[];
                    revs.map((row)=>{
                        usr_arr.push(new mongoose.Types.ObjectId(row.user_id));
                    });
                    User.find({_id:{$in:usr_arr}}).exec(function(err,users) {
                        if (err)
                            res.status(500).send({error:err});
                        else {
                            /*[ {label: 'apples',data: [12, 19, 3, 17, 28, 24, 7]},
                             {label: 'oranges',data: [30, 29, 5, 5, 20, 3, 10]} ]*/
                            var dataset=[];
                            users.map((user)=>{
                                var obj = {data:[], label:user.username};
                                dates.map((date)=>{
                                    var cnt = 0;
                                    revs.map((rev)=>{
                                        if (date == moment(rev.date_added).format('MMM D') && user._id == rev.user_id) {
                                        cnt++;
                                        }
                                    });
                                    obj.data.push(cnt);
                                });
                                dataset.push(obj);
                            });

                            res.json({dataset:dataset, dates:dates});
                        }
                    });
                }
            });
        }
    } else {
        res.status(500).send({error:'Current user doesnt have permission for this action'});
    }
});

router.get('/stories_per_location', function(req,res) {
    if (req.session.user==null) {
        res.status(500).send({error:"User not logged in"})
    } else if (req.session.user.type === 'admin') {
        if (!req.query.fromDate || !req.query.toDate) {
            res.status(500).send({error: "No datespan given"});
        } else {
            var from = req.query.fromDate;
            var to = req.query.toDate;
            var dates = getDates(from,to);
            Review.find({date_added: {$gte: from, $lte: to}}).exec(function(err,revs) {
                if (err)
                    res.status(500).send({error:err});
                else {
                    var loc_arr=[];
                    revs.map((row)=> {
                        loc_arr.push(new mongoose.Types.ObjectId(row.location));
                    });
                    Location.find({_id:{$in:loc_arr}}).exec(function(err,locs) {
                        if (err)
                            res.status(500).send({error:err});
                        else {
                            var dataset=[];
                            locs.map((loc)=>{
                                var obj = {data:[], label:loc.city+', '+loc.country};
                                dates.map((date)=>{
                                    var cnt = 0;
                                    revs.map((rev)=>{
                                        if (date == moment(rev.date_added).format('MMM D') && loc._id == rev.location) {
                                            cnt++;
                                        }
                                    });
                                    obj.data.push(cnt);
                                });
                                dataset.push(obj);
                            });

                            res.json({dataset:dataset, dates:dates});
                        }
                    });
                }
            });
        }
    } else {
        res.status(500).send({error:'Current user doesnt have permission for this action'});
    }
});

router.get('/views_per_story', function(req,res) {
    if (req.session.user==null) {
        res.status(500).send({error:"User not logged in"})
    } else if (req.session.user.type === 'admin') {
        if (!req.query.fromDate || !req.query.toDate) {
            res.status(500).send({error: "No datespan given"});
        } else {
            var from = req.query.fromDate;
            var to = req.query.toDate;
            var dates = getDates(from,to);
            StoryViews.find({date_added: {$gte: from, $lte: to}}).exec(function(err,views) {
                if (err)
                    res.status(500).send({error:err});
                else {
                    var rev_arr=[];
                    views.map((row)=> {
                        rev_arr.push(new mongoose.Types.ObjectId(row.review));
                    });
                    Review.find({_id:{$in:rev_arr}}).exec(function(err,revs) {
                        if (err)
                            res.status(500).send({error:err});
                        else {
                            var dataset=[];
                            revs.map((rev)=>{
                                var obj = {data:[], label:rev.title};
                                dates.map((date)=>{
                                    var cnt = 0;
                                    views.map((view)=>{
                                        if (date == moment(view.date_added).format('MMM D') && view.review == rev._id) {
                                            cnt++;
                                        }
                                    });
                                    obj.data.push(cnt);
                                });
                                dataset.push(obj);
                            });
                            res.json({dataset:dataset, dates:dates});
                        }
                    });
                }
            });
        }
    } else {
        res.status(500).send({error:'Current user doesnt have permission for this action'});
    }
});

router.get('/views_per_location', function(req,res) {
    if (req.session.user==null) {
        res.status(500).send({error:"User not logged in"})
    } else if (req.session.user.type === 'admin') {
        if (!req.query.fromDate || !req.query.toDate) {
            res.status(500).send({error: "No datespan given"});
        } else {
            var from = req.query.fromDate;
            var to = req.query.toDate;
            var dates = getDates(from,to);
            LocationViews.find({date_added: {$gte: from, $lte: to}}).exec(function(err,views) {
                if (err)
                    res.status(500).send({error:err});
                else {
                    var loc_arr=[];
                    views.map((row)=> {
                        loc_arr.push(new mongoose.Types.ObjectId(row.location));
                    });
                    Location.find({_id:{$in:loc_arr}}).exec(function(err,locs) {
                        if (err)
                            res.status(500).send({error:err});
                        else {
                            var dataset=[];
                            locs.map((loc)=>{
                                var obj = {data:[], label:loc.city + ', ' + loc.country};
                                dates.map((date)=>{
                                    var cnt = 0;
                                    views.map((view)=>{
                                        if (date == moment(view.date_added).format('MMM D') && view.location == loc._id) {
                                            cnt++;
                                        }
                                    });
                                    obj.data.push(cnt);
                                });
                                dataset.push(obj);
                            });
                            res.json({dataset:dataset, dates:dates});
                        }
                    });
                }
            });
        }
    } else {
        res.status(500).send({error:'Current user doesnt have permission for this action'});
    }
});

function getDates(startDate, finishDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(finishDate);
    while (currentDate <= stopDate) {
        dateArray.push(moment(currentDate).format('MMM D'))
        currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
}

module.exports=router;