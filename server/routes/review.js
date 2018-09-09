var express    = require('express');
var router = express.Router();
var app = express();
require('run-middleware')(app);
var Review=require('../models/review');
var Rating=require('../models/rating');
var Location = require('../models/location');
var StoryView = require('../models/story_views');
var User = require('../models/user');
var fs = require('fs');
var Jimp = require("jimp");
var validator = require('../additional_functions/validator');
var Busboy = require('busboy');
var mongoose = require('mongoose');
var getDistance = require('../additional_functions/calc_distance');
var htmlparser = require("htmlparser2");
var request = require('request');
var DCT_funcs =  require('../additional_functions/DCT');

/* GENERATOR */
router.post('/generate_stories', function(req,res) {
	Location.find({country: {$in: ["Croatia", "Austria", "Turkey", "Italy", "France"]}},function(err,locs) {
		if (err)
			res.status(500).send({error: err});
		else {
			var titles = ["Smashing holiday!", "Life changing experience", "What a trip!", "My worst holiday yet", "Chimps and Beer", "Well deserved break", "Time-out from civilization", "Snakes, snakes everywhere", "Best vacation so far", "A real journey", "More adventureous than Indiana Jones movies", "Giro & patatas", "Sculp-tastic!", "I'm not lost, I'm exploring", "The place to be", "Hot, but lovely", "Paradise",
				"Luxurious nature", "Wooden beds & great friends", "Exquisite Jungles", "My holiday in this beautiful place", "Relaxing time!", "Smelly,smelly,smelly!", "How all can go terribly wrong vol. 1", "Totally worth it", "More stars than Hollywood", "A week well spent", "Sheep in the big city", "The quiet life", "Fantastic holiday", "Charging my batteries", "Shipwreck!", "Sun + Fun", "Simply WOW!", "Heaven on Earth"];
			var pics=[];
			var startDiv=0;
			request("http://www.gettyimages.com/photos/tourist?page=5&excludenudity=true&sort=mostpopular&mediatype=photography&phrase=tourist", function (error, response, body1) {
				if (error) {
					//http://www.gettyimages.com/photos/beach-holiday?excludenudity=true&mediatype=photography&page=2&phrase=beach%20holiday&sort=mostpopular
					//console.log('error: 1st REQ ERR');
				} else {
					var parser = new htmlparser.Parser({
							onopentag: (name, attribs)=>{
								if (name === "a" && attribs.class === "search-result-asset-link"){
									startDiv = 1;
								}
								else if (name === "img" && startDiv === 1) {
									pics.push(attribs.src.split('?')[0]);
								}
							},
							onclosetag: (tagname)=>{
								if(tagname === "a"){
									startDiv = 0;
								}
							}
						}, {decodeEntities: true}
					);
					parser.write(body1);
					parser.end();
					request("http://www.gettyimages.com/photos/tourist?page=5&excludenudity=true&sort=mostpopular&mediatype=photography&phrase=tourist", function (error, response, body2) {
						if (error) {
							//console.log('error: 1st REQ ERR');
						} else {
							var parser = new htmlparser.Parser({
									onopentag: (name, attribs)=>{
										if (name === "a" && attribs.class === "search-result-asset-link"){
											startDiv = 1;
										}
										else if (name === "img" && startDiv === 1) {
											pics.push(attribs.src.split('?')[0]);
										}
									},
									onclosetag: (tagname)=>{
										if(tagname === "a"){
											startDiv = 0;
										}
									}
								}, {decodeEntities: true}
							);
							parser.write(body2);
							parser.end();

							User.find(function (err,users) {
								if (err)
									res.status(500).send({error: err});
								else {
									titles.map((title) => {
										var rnd_loc = parseInt(Math.random() * (locs.length-1));
										var rnd_pic = parseInt(Math.random() * (pics.length-2));
										var rnd_usr = parseInt(Math.random() * (users.length-1000));

										var rev = new Review();
										rev.title = title;
										rev.description = "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere.";
										rev.location = locs[rnd_loc]._id;
										rev.user_id = users[rnd_usr]._id;
										rev.pictures = [pics[rnd_pic], pics[rnd_pic+1]];
										rev.save(function(err) {
											if (err)
												res.status(500).send({error: err});
										});
									});
								}
							});
							/*request("http://www.gettyimages.com/photos/beach-holiday?excludenudity=true&sort=mostpopular&mediatype=photography&phrase=beach%20holiday", function (error, response, body3) {
								if (error) {
									//console.log('error: 1st REQ ERR');
								} else {
									var parser = new htmlparser.Parser({
											onopentag: (name, attribs)=>{
												if (name === "a" && attribs.class === "search-result-asset-link"){
													startDiv = 1;
												}
												else if (name === "img" && startDiv === 1) {
													pics.push(attribs.src);
												}
											},
											onclosetag: (tagname)=>{
												if(tagname === "a"){
													startDiv = 0;
												}
											}
										}, {decodeEntities: true}
									);
									parser.write(body3);
									parser.end();
									// END OF PARSING
								}
							});*/
						}
					});
				}
			});
		}
	});
});
router.post('/generate_likes', function(req,res) {
	User.find(function(err,users) {
		if (err)
			res.status(500).send({ error: err });
		else {
			Review.find(function(err,revs) {
				if (err)
					res.status(500).send({ error: err });
				else {
					revs.map((rev) => {
                        var rnd_usr = parseInt(Math.random() * (users.length-600));
						for (var i=0;i<=60;i++) {
                            gen_upvote(users[rnd_usr+i]._id, rev._id);
						}
					});
				}
			});
		}
	});
});
/* GENERATOR */

// add review
router.post('/', function(req,res){
	if(req.session.user==null){
		res.status(500).send({ error: "User not logged in!"})
	}
	else {
		var rev=new Review();
		var paths = [];
		var data = {};
		data.pictures=[];
		data.user_id = req.session.user._id;
		var cnt = 1;
		var busboy = new Busboy({ headers: req.headers });
		busboy.on('file', function(fieldname, file, filename, encoding, mimetype) { // IMAGE
			var path = "server/images/"+rev._id + "_pic_" + cnt+"."+mimetype.split('/')[1];
			paths.push(path);
			cnt++;
			file.pipe(fs.createWriteStream(path));
		}); // FIELDS
		busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
			data[fieldname] = val;
		});
		busboy.on('finish', function() {
			var valid = validator({
				title: {type:"string", required:true},
				description: {type:"string", required:true},
				location: {type:"string", required:true}
			}, data);

			if (valid != "") { // INVALID
				console.log("INVALID");
				for (var p_ind=0; p_ind<paths.length; p_ind++) {
					fs.unlink(paths[p_ind]);
				}
				res.status(500).send({ error: valid });
			} else { // VALID
				var pixR, pixG, pixB, path="";
                (function next(p_ind) {  // async loop (recursive func)
                    if (p_ind === paths.length) { // No items left
                        Object.keys(data).map(function (key) {
                            rev[key] = data[key];
                        });

                        rev.save(function (err, r) {
                            if (err) {
                                res.status(500).send({error: err});
                            }
                            else {
                                res.json(r);
                            }
                        });
                        return;
                    }
                    path = paths[p_ind];
                    Jimp.read(path).then(function (image) {
                        var i, j, ind;
                        // RESIZE
                        image.resize(image.bitmap.width/2, image.bitmap.height/2);
                        if (image.bitmap.height % 8 !== 0 || image.bitmap.width % 8 !== 0) {
                            image.resize(image.bitmap.width + (8 - image.bitmap.width % 8), image.bitmap.height + (8 - image.bitmap.height % 8));
                        }


                        pixR = DCT_funcs.Create2DArray(image.bitmap.height);
                        pixG = DCT_funcs.Create2DArray(image.bitmap.height);
                        pixB = DCT_funcs.Create2DArray(image.bitmap.height);

                        for (i = 0; i < image.bitmap.height; i++) {
                            for (j = 0; j < image.bitmap.width; j++) {
                                var pixCol = Jimp.intToRGBA(image.getPixelColor(j, i));
								// TRANSFORM TO YCbCr !!!
								var Y = parseInt(16 + parseFloat(0.256789 *pixCol.r)+parseFloat(0.5041289*pixCol.g)+parseFloat(0.0979     *pixCol.b));
								var Cb = parseInt(128+parseFloat(-0.148222*pixCol.r)+parseFloat(-0.29099 *pixCol.g)+parseFloat(0.4392148  *pixCol.b));
								var Cr = parseInt(128+parseFloat(0.4392148*pixCol.r)+parseFloat(-0.367789*pixCol.g)+parseFloat(-0.07142578*pixCol.b));

                                pixR[i][j] = parseInt(Y); // pixCol.r
                                pixG[i][j] = parseInt(Cb); // pixCol.g
                                pixB[i][j] = parseInt(Cr); // pixCol.b
                            }
                        }
                        // convert pixels (DCT)
                        var pixDCT_R = DCT_funcs.DCT(pixR, image.bitmap.height, image.bitmap.width);
                        var pixDCT_G = DCT_funcs.DCT(pixG, image.bitmap.height, image.bitmap.width);
                        var pixDCT_B = DCT_funcs.DCT(pixB, image.bitmap.height, image.bitmap.width);

                        var bits = "";
                        var pixRbits = DCT_funcs.Kodiraj(pixDCT_R);
                        var pixGbits = DCT_funcs.Kodiraj(pixDCT_G);
                        var pixBbits = DCT_funcs.Kodiraj(pixDCT_B);
                        // add height / width on start (2bytes each)
                        bits = String("0000000000000000" + parseInt(image.bitmap.width).toString(2)).slice(-16) + bits;
                        bits = String("0000000000000000" + parseInt(image.bitmap.height).toString(2)).slice(-16) + bits;
                        // add R,G,B bits
                        bits += pixRbits;
                        bits += pixGbits;
                        bits += pixBbits;
                        // correct length (%8)
                        while (bits.length % 8 !== 0) {
                            bits += "0";
                        }

                        // save file
                        var bin_path = path.split('.')[0] + ".bimg";
                        data.pictures.push(bin_path);
                        var bytes_write = new Uint8Array(bits.length / 8);
                        for (i = 0, ind = 0; i < bits.length; i += 8, ind++) {
                            bytes_write[ind] = parseInt(bits.substring(i, i + 8), 2);
                        }

                        fs.writeFile(bin_path, new Buffer(bytes_write), function (err) {
                            if (err) {
                                throw err;
                            }
                            console.log("Saved: " + bin_path);
                            fs.unlink(path);
                            next(p_ind + 1);
                        });
                    }).catch(function (err) {
                        console.log("ERR " + err);
                    });
                })(0);
			}
		});
		req.pipe(busboy);
	}
});

// update review
router.put('/:id', function(req,res) {
	if(req.session.user==null){
		res.status(500).send({ error: "User not logged in!"})
	}
	else {
		Review.findById(req.params.id, function(err, rev) {
			if (err)
				res.status(500).send({error: err});
			else if (!rev) {
				res.status(500).send({error: "Review doesn't exist"});
			}
			else {
				if (rev.user_id == req.session.user._id || req.session.user.type=="admin") {
					var data = {};
					data.pictures = [];
					data.user_id = req.session.user._id;
					var cnt = 1;
					var busboy = new Busboy({headers: req.headers});
					busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
						var path = "server/images/" + rev._id + "_pic_" + cnt + "." + mimetype.split('/')[1];
						data.pictures.push("http://localhost:8080/"+path);
						cnt++;
						file.pipe(fs.createWriteStream(path));
					});
					busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
						data[fieldname] = val;
					});
					busboy.on('finish', function () {
						var valid = validator({
							title: {type:"string", required:true},
							description: {type: "string", required: true},
							location: {type: "string", required: true}
						}, data);

						if (valid != "") { // INVALID
							res.status(500).send({error: valid});
						} else { // VALID
							Object.keys(data).map((key)=> {
								if ((key == "pictures" && data[key].length > 0) || key != "pictures")
									rev[key] = data[key];
							});

							rev.save(function (err, r) {
								if (err)
									res.status(500).send({error: err});
								else
									res.json(r);
							});
						}
					});
					req.pipe(busboy);
				} else {
					res.status(500).send({error: "Current user doesn't have permission for this action"});
				}

			}
		});
	}
});

// update rating
router.put('/rating/:id', function(req, res) {
	if(req.session.user==null){
		res.status(500).send({ error: "User not logged in!"});
	}
	else {
		Review.findById(req.params.id, function(err, rev) {
			if (err) {
				res.status(500).send({error:err});
			}
			else if (!rev) {
				res.status(500).send({error: "Review doesn't exist"});
			} 
			else {
				// Check if user has already upvoted the story
				Rating.findOne({user: req.session.user._id,review: req.params.id}).exec(function(err,rtn) {
					if (err) {
                        res.status(500).send({error:err});
                    }
					else if(rtn==null){ // hasn't upvoted -> upvote
						rev.rating += 1;

						rev.save(function (err, r) {
							if (err)
								res.status(500).send({error: err});
							else {
								rtn = new Rating();
								rtn.user = req.session.user._id;
								rtn.review = req.params.id;

								rtn.save(function (err,rng) {
									if (err)
										res.status(500).send({error: err});
									else
										res.json(r);
								});
							}
						});
					} else { // has upvoted -> remove upvote
						rev.rating -= 1;

						rev.save(function (err, r) {
							if (err)
								res.status(500).send({error: err});
							else {
								rtn.remove(function (err) {
									if (err)
										res.status(500).send({error: err});
									else
										res.json(r);
								});
							}
						});
					}
				});

				//}
			}
		});
	}
});

// increment VIEWS
router.put('/views/:id', function (req,res) {
    Review.findById(req.params.id, function (err, rev) {
        if (err)
            res.status(500).send({error: err});
        else if (!rev)
            res.status(500).send({error: err});
        else {
        	var view = new StoryView();
        	view.review = req.params.id;

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
		Review.findById(req.params.id, function(err, rev) {
			if (err) {
				res.status(500).send({error:err});
			}
			else if (!rev) {
				res.status(500).send({error: "Review doesn't exist"});
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
					rev.comments.push(data);
					rev.save(function (err, r) {
						if (err)
							res.status(500).send({error: err});
						else
							res.json(r);
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
		Review.findById(req.params.id, function (err, rev) {
			if (err) {
				res.status(500).send({error: err});
			}
			else if (!rev) {
				res.status(500).send({error: "Review doesn't exist"});
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
					rev.comments.map((row) => {
						if (data.comment_id == row._id && data.user_id != row.user_id) {
							x = false;
						}
						else if (data.comment_id != row._id) {
							cms.push(row);
						}
					});

					if (x) {
						rev.comments = cms;
						rev.save(function(err, r) {
							if (err)
								res.status(500).send({error: err});
							else
								res.json(r);
						});
					} else {
						res.status(500).send({error: "Current user doesn't have permission for this action"});
					}
				}
			}
		});
	}
});

// return all reviews
router.get('/', function(req,res) {
	var find = {};
	var sort={};
	var limit=0;
	if (req.query.search) {
		find = { "$text": { "$search":  req.query.search}},{ score: { $meta: "textScore" }};
	}
	else if (req.query.user) {
		find = {user_id:req.query.user};
	}
	else if (req.query.location) {
		find = {location: req.query.location};
	}
	if (req.query.sort) {
		if (req.query.sort=="date")
			sort = {date_added:-1};
		else if (req.query.sort=="rating")
			sort = {rating: -1};
	}
	if (req.query.limit) {
		limit = parseInt(req.query.limit);
	}
	Review.find(find).sort(sort).limit(limit).exec(function(err, r) {
		if (err)
			res.status(500).send({ error: err });
		else {
			res.json(r);
		}
	});
});
// return reviews by user's geolocation
router.get('/geo', function (req,res) {
	if (req.query.lat && req.query.lon) {
		Review.find(function (err, revs) {
			if (err)
				res.status(500).send({error: err});
			else {
				var rev_loc_arr =[];
				revs.map((row)=>{
					rev_loc_arr.push(row.location);
				});

				Location.find({_id: {$in: rev_loc_arr}}).exec(function(err, locs) {
					if (err)
						res.status(500).send({error: err});
					else {
						var max = 550; // kilometres
						if (req.query.max) {
							max = parseInt(req.query.max);
						}
						var loc_arr=[];
						locs.map((row) => {
							var distance = getDistance(req.query.lat, req.query.lon, row.latitude, row.longitude);
							if (distance<max) {
								loc_arr.push(row._id);
							}
						});

						var limit=0;
						if (req.query.limit) {
							limit = parseInt(req.query.limit);
						}
						if (req.session.user==null) {// if user is not logged in
							Review.find({location: {$in: loc_arr}}).limit(limit).exec(function(err, rvs) {
								if (err)
									res.status(500).send({error: err});
								else
									res.json(rvs);
							});
						} else { // if user is logged in -> don't return reviews written by him/her
							Review.find({user_id: {$ne: req.session.user._id},location: {$in: loc_arr}}).limit(limit).exec(function(err, rvs) {
								if (err)
									res.status(500).send({error: err});
								else
									res.json(rvs);
							});
						}
					}
				});
			}
		});
	} else {
		res.status(500).send({error: "No coordinates given!"});
	}
});
//return TRENDING reviews (based on views and rating in the last week, sorted by views and then rating)
// CHANGE : correct:$gte , now: $lte
router.get('/trending', function(req,res) {
    StoryView.find({date_added: {$lte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7)}}).exec(function(err,views) {
        if (err)
            res.status(500).send({error:err});
        else if (!views)
        	res.status(500).send({error: "No views in the last week!"});
        else {
        	var rev_arr=[];
        	views.map((view)=> {
        		rev_arr.push(new mongoose.Types.ObjectId(view.review));
			});
        	Review.find({_id:{$in:rev_arr}}).exec(function(err,revs){
                if (err)
                    res.status(500).send({error:err});
                else {
                	var reviews = revs;
                    reviews.map((rev)=>{
                    	rev.votes = 0;
                        views.map((view)=> {
							if (rev._id == view.review) {
								rev.votes += 1;
							}
						});
					});

                    reviews.sort(function(a,b) {
                    	return b.views - a.views;
					});
                    var final_revs = [];
                    for (var i=0;i<8;i++) {
                    	final_revs.push(reviews[i]);
					}
                    res.json(final_revs);
                }
			});
        }
	});

	Review.find().sort({views:-1, rating:-1}).limit(6).exec(function(err,revs) {

    });
});

// return reviews based on likes
router.get('/by_rating/:id', function(req,res) {
	if (req.session.user==null) {
		res.status(500).send({error: "User not logged in!"});
	} else {
		var limit=0;
		if (req.query.limit) {
			limit = parseInt(req.query.limit);
		}
		Rating.find({user: req.session.user._id}, function(err,ratings) {
			if (err)
				res.status(500).send({error: err});
			else {
				var rev_arr = [];
				ratings.map((row) => { // all reviews that the user has 'upvoted'
					rev_arr.push( new mongoose.Types.ObjectId(row.review));
				});

				Review.find({_id: {$in: rev_arr}}, function(err,revs) {
					if (err)
						res.status(500).send({error: err});
					else {
						var loc_arr = [];
						revs.map((row) => { // locations of given reviews
							loc_arr.push( new mongoose.Types.ObjectId(row.location));
						});
						
						Location.find({_id : {$in: loc_arr}}, function(err,locs) {
							if (err)
								res.status(500).send({error: err});
							else {
								Location.find(function(err,all_locs) {
									if (err)
										res.status(500).send({error: err});
									else {
										var fin_loc = [];
										var max = 400; // max radius in km
										if (req.query.max) {
											max = parseInt(req.query.max);
										}
										locs.map((loc1) => {
											all_locs.map((loc2) => {
												var dist = getDistance(loc1.latitude, loc1.longitude, loc2.latitude, loc2.longitude);
												if (dist < max) 
													fin_loc.push(loc2._id); // locations near the given review's location
											});
										});

										rev_arr.push(req.params.id);
										Review.find({_id: {$nin:rev_arr}, user_id:{$ne:req.session.user._id},location:{$in:fin_loc}}).sort({rating:-1}).limit(limit).exec(function(err,fin_revs) {
											if (err)
												res.status(500).send({error: err});
											else
												res.json(fin_revs);
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}
});
// return upvote/s
router.get('/votes/:id', function(req,res) {
    if (req.session.user!=null) {
        Rating.findOne({user:req.session.user._id, review: req.params.id}, function(err,rtn) {
            if (err)
                res.status(500).send({error:err});
            else if (rtn==null)
                res.json({exists:false});
            else
                res.json({exists:true});
        });
    } else {
	 	res.json({msg:"User not logged in"});
    }
});
// return reviews by location_id
router.get('/location/:loc_id', function(req,res) {
	Review.find({location: req.params.loc_id}, function(err,res) {
		if (err)
			res.status(500).send({error:err});
		else
			res.json(res);
	});
});
// return single review
router.get('/:id',function(req, res) {
	Review.findById(req.params.id, function(err, r) {
		if (err)
			res.status(500).send({ error: err });
		else if (!r)
			res.status(500).send({error: "Review doesn't exist"});
		else {
            res.json(r);
            /*if (r.pictures && r.pictures.length>0 && (r.pictures[0].split('.')[1] == "bin" || r.pictures[0].split('.')[1] == "bimg")) {
            	console.log("IF");
                var pic_files = r.pictures;
                r.pictures = [];
                (function next(p_ind) {
                    if (r.pictures.length == pic_files.length) {
                        res.json(r);
                    }

                    var path = ""+pic_files[p_ind];
                    if (path!="" && p_ind!=pic_files.length) {
                        fs.readFile(path, function(err, data) {
                            if (err) {
                                //res.status(500).send({error: err});
                                throw err;
                            }
                            //var rs = "";
                            var pics = [];
                            for (var z=0; z<data.length; z++) {
                                //rs += String("00000000"+parseInt(data[z]).toString(2)).slice(-8);
                                pics.push(parseInt(data[z]));
                            }
                            r.pictures.push(pics);
                            next(p_ind+1);
                        });
                    }
                })(0);
            }
            else {
                console.log("ELSE");
                res.json(r);
            }*/
		}
	});
});

// delete review
router.delete('/:id', function(req,res){
	if(req.session.user==null){
		res.status(500).send({ error: "User not logged in!"})
	}
	else {
		// check the review's id then check if the logged user is the owner of the given review
		Review.findOne({"_id":req.params.id, "user_id":req.session.user._id},function(err, r) {
			if (err)
				res.status(500).send({error: err});
			else if (!r) {
				res.status(500).send({error: "Review doesn't exist // User doesn't have permission"});
			}
			else {
				r.remove(function (err) {
					if (err)
						res.status(500).send({error: err});
					else {
						res.json({msg: "OK"});
					}
				});
			}
		});
	}
});

// WEB SOCKET
router.ws('/picture', function(ws, req) {
    var first_part, second_part, third_part, last_part;
    ws.on('message', function(msg) {
        console.log("SOCKET_MSG: ", msg);

    	if (msg.substring(0,4) == "path") {
            console.log("FIRST");
            var pic = msg.split("=")[1];
            var path = "server/images/" + pic + ".bimg";
            fs.readFile(path, function (err, data) {
                if (err) {
                    //res.status(500).send({error: err});
                    throw err;
                }
                var bit_string = "";
                //var pics = [];
                for (var z = 0; z < data.length; z++) {
                    bit_string += String("00000000" + parseInt(data[z]).toString(2)).slice(-8);
                    //pics.push(parseInt(data[z]));
                }

                var bit_index = 0;
                var height = parseInt(bit_string.substring(bit_index, bit_index + 16), 2);
                bit_index += 16;
                var width = parseInt(bit_string.substring(bit_index, bit_index + 16), 2);
                bit_index += 16;


                var blocks_w_size = parseInt(String(width / 8));
                var blocks_h_size = parseInt(String(height / 8));
                var blocks_size = blocks_h_size * blocks_w_size;

                var pixR = decodePixels();
                var pixG = decodePixels();
                var pixB = decodePixels();

                // DATA: 0 - type, 1,2 - height/width, rest - RGB data
                first_part = new Uint16Array(1 + 2 + pixR.length * 3);
                second_part = new Uint16Array(1 + 2 + pixR.length * 9 * 3);
                third_part = new Uint16Array(1 + 2 + pixR.length * 39 * 3);
                last_part = new Uint16Array(1 + 2 + pixR.length * 15 * 3);
                first_part[0] = 1;
                second_part[0] = 2;
                third_part[0] = 3;
                last_part[0] = 4;
                first_part[1] = second_part[1] = third_part[1] = last_part[1] = height;
                first_part[2] = second_part[2] = third_part[2] = last_part[2] = width;

                for (var i = 0, fi = 3, si = 3, ti = 3, li = 3; i < pixR.length; i++, fi+=3) { //
                    for (var ind = 0; ind<64; ind++) {
                        if (ind == 0) {
                            first_part[fi] = pixR[i][ind];
                            first_part[fi + 1] = pixG[i][ind];
                            first_part[fi + 2] = pixB[i][ind];
                        } else if (ind > 0 && ind < 10) {
                            second_part[si] = pixR[i][ind];
                            second_part[si+1] = pixG[i][ind];
                            second_part[si+2] = pixB[i][ind];
                            si+=3;
                        } else if (ind > 9 && ind < 49) {
                            third_part[ti] = pixR[i][ind];
                            third_part[ti+1] = pixG[i][ind];
                            third_part[ti+2] = pixB[i][ind];
                            ti+=3;
                        } else if (ind > 48 && ind < 64) {
                            last_part[li] = pixR[i][ind];
                            last_part[li+1] = pixG[i][ind];
                            last_part[li+2] = pixB[i][ind];
                            li+=3;
                        }
                    }
                }
                // SEND
                ws.send(first_part);

                function decodePixels() {
                    var res = [], zz_piksli = [];
                    var blocks_num = 0, blocks_h = 0, blocks_w = 0, num_coef = 0;

                    while (blocks_num < blocks_size) {
                        if (num_coef == 0) // zacetek bloka -> DC
                        {
                            var neg = bit_string.substring(bit_index, bit_index + 1);
                            bit_index += 1;
                            var DC = parseInt(bit_string.substring(bit_index, bit_index + 11), 2);
                            bit_index += 11;

                            if (neg == "1") {
                                DC *= -1;
                            }
                            zz_piksli[num_coef] = DC;
                            num_coef += 1;
                        }

                        var code_type = bit_string.substring(bit_index, bit_index + 1);
                        bit_index += 1;
                        if (code_type == "0") // A / B
                        {
                            var tek_dolz = parseInt(bit_string.substring(bit_index, bit_index + 6), 2); // 6biti tek_dolz
                            bit_index += 6;
                            for (var x = 0; x < tek_dolz; x++) {
                                zz_piksli[num_coef] = 0;
                                num_coef += 1;
                            }

                            if (num_coef != 64) // A
                            {
                                var AC_length = parseInt(bit_string.substring(bit_index, bit_index + 4), 2);  // 4biti dolzina
                                bit_index += 4;

                                var neg = bit_string.substring(bit_index, bit_index + 1);
                                bit_index += 1;
                                var AC = parseInt(bit_string.substring(bit_index, bit_index + (AC_length - 1)), 2); // |dolzina-1|biti AC
                                bit_index += AC_length - 1;

                                if (neg == "1") {
                                    AC *= -1;
                                }
                                zz_piksli[num_coef] = AC;
                                num_coef += 1;
                            }
                        }
                        else if (code_type == "1") // C
                        {
                            var AC_length = parseInt(bit_string.substring(bit_index, bit_index + 4), 2);  // 4biti dolzina
                            bit_index += 4;

                            var neg = bit_string.substring(bit_index, bit_index + 1);
                            bit_index += 1;
                            var AC = parseInt(bit_string.substring(bit_index, bit_index + (AC_length - 1)), 2); // |dolzina-1|biti AC
                            bit_index += AC_length - 1;

                            if (neg == "1") {
                                AC *= -1;
                            }
                            zz_piksli[num_coef] = AC;
                            num_coef += 1;
                        }


                        if (num_coef == 64) // KONEC BLOKA, zacetek novega
                        {
                            //console.log("Block #"+blocks_num+" done!");
                            // iZIGZAG
                            //var pixs = iZigZag(zz_piksli);
                            // iDCT
                            //pixs = iDCT(pixs);

                            res.push(zz_piksli);
                            // RESET VALUES
                            num_coef = 0;
                            blocks_num += 1;
                            blocks_w += 1;
                            zz_piksli = [];

                            if (blocks_w == blocks_w_size) // konec vrstice (koncni stolpec)
                            {
                                blocks_w = 0;
                                blocks_h += 1;
                            }
                        }
                    }

                    return res;
                }
            });
        }
        else if (msg.substring(0,6) == "second") {
            console.log("SECOND");
			ws.send(second_part);
		}
        else if (msg.substring(0,5) == "third") {
            console.log("THIRD");
            ws.send(third_part);
        }
        else if (msg.substring(0,4) == "last") {
            console.log("LAST");
            ws.send(last_part);
        }
	});
});


function gen_upvote(user_id, rev_id) {
	Review.findById(rev_id, function(err, rev) {
		if (err) {
			//res.status(500).send({error:err});
		}
		else if (!rev) {
			//res.status(500).send({error: "Review doesn't exist"});
		}
		else {
			// Check if user has already upvoted the story
			Rating.findOne({user: user_id,review: rev_id}).exec(function(err,rtn) {
				if (err){
                    //res.status(500).send({error:err});
                }
				else if(rtn==null){ // hasn't upvoted -> upvote
					rev.rating += 1;

					rev.save(function (err, r) {
						if (err)
							res.status(500).send({error: err});
						else {
							rtn = new Rating();
							rtn.user = user_id;
							rtn.review = rev_id;

							rtn.save(function (err,rng) {
								if (err) {
									//res.status(500).send({error: err});
                                }
							});
						}
					});
				} else { // has upvoted -> remove upvote
					rev.rating -= 1;

					rev.save(function (err, r) {
						if (err)
							res.status(500).send({error: err});
						else {
							rtn.remove(function (err) {
								if (err) {
                                    //res.status(500).send({error: err});
                                }
							});
						}
					});
				}
			});
		}
	});
}

module.exports=router;
