var express    = require('express'); 
var User  = require('../models/user');
var Review = require('../models/review');
var Location = require('../models/location');
var mongoose = require('mongoose');
var router 	   = express.Router();              //mini aplikacija oz del aplikacije
var passwordHash = require('password-hash');
var emailCheck = require("email-check");
var fs = require('fs');
var validator = require('../additional_functions/validator');
var Busboy = require('busboy');
// AUDIO --
var uLaw = require('../additional_functions/u_law');
var wav = require('wav');
var WavDecoder = require("wav-decoder");
var tone = require('tonegenerator');
var header = require('waveheader');
// -- AUDIO

var readFile = function (filepath) {
    return new Promise(function(resolve, reject) {
    	fs.readFile(filepath, function(err, buffer) {
            if (err) {
                return reject(err);
            }
            return resolve(buffer);
		});
	});
};

//add user
router.post('/', function(req, res) {
            var data = {};
            var user=new User();
		    var busboy = new Busboy({ headers: req.headers });
		    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                var path = "server/images/"+user._id + "_prof_pic"+"."+mimetype.split('/')[1];
                data.profile_picture = "http://localhost:8080/"+path;
                file.pipe(fs.createWriteStream(path));
            });
		    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
            	fieldname=="age" ? data[fieldname] = parseInt(val) : data[fieldname] = val;
            });
            busboy.on('finish', function() {
				/*emailCheck(data.email)//data.email
				 .then(function (r) {
				 if (r) {*/
                var q = User.findOne({$or: [{'email': data.email}, {'username': data.username}]});
                q.exec(function (err, u) {
                    if (err)
                        res.send(err);
                    else if (u == null) {
                        //validate
                        var valid = validator({
                            first_name: {type: "string", required: true},
                            last_name: {type: "string", required: true},
                            password: {type: "string", required: true},
                            username: {type: "string", required: true},
                            email: {type: "string", required: true},
                            mimetype: {type: "string", required: false},
                            city: {type: "string", required: false},
                            country: {type: "string", required: false},
                            description: {type: "string", required: false},
                            age: {type: "number", required: false}
                        }, data);

                        if (valid != "") { // INVALID
                            res.status(500).send({error: valid});
                        } else { // VALID
                            //upload pic
                            Object.keys(data).map((key) => {
                                if (key == "password")
                                    user[key] = passwordHash.generate(data[key]);
                                else
                                    user[key] = data[key];
                            });

                            user.save(function (err, u) {
                                if (err)
                                    res.status(500).send({error: err});
                                else {
                                    fs.readFile("server/audios/happyRegister.bin", function (err, data) {
                                        if (err) {
                                            res.json(u);
                                            //res.status(500).send({error: err});
                                            throw err;
                                        }

                                        var send_buffer = [];
                                        for (var z = 0; z < data.length; z++) {
                                            send_buffer[z] = (parseInt(data[z]) > 127 && z > 1) ? parseInt(data[z])-256 : parseInt(data[z]);
                                        }

                                        var res_data = {_id: u._id, buffer: send_buffer};
                                        res.json(res_data);
                                    });
								}
                            });
                        }
                    }
                    else
                        res.status(500).send({error: "A user with this email/username already exists!"});
                });
            });
					/*} else {
						res.status(500).send({ error: "Invalid email!"});
					}
				})
                .catch(function (err) {
					res.status(500).send({ error: "Invalid mail!" });
                });
            });*/
            req.pipe(busboy);
});

//update user info
router.put('/:u_id',function(req, res) {
	if (req.session.user==null) {
		res.status(500).send({error: "User not logged in"});
	} else {
		User.findById(req.params.u_id, function(err, user) {
			if (err)
				res.status(500).send({ error: err });
			else if (!user) {
				res.status(500).send({ error: "User doesn't exist" });
			}
			else {
				if (user._id == req.session.user._id || req.session.user.type == "admin") {
					var data = {};
					var busboy = new Busboy({ headers: req.headers });
					busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
						var path = "server/images/"+req.params.u_id + "_prof_pic"+"."+mimetype.split('/')[1];
						data.mimetype = mimetype;
                        data.profile_picture = "http://localhost:8080/"+path;
						file.pipe(fs.createWriteStream(path));
					});
					busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
						fieldname=="age" ? data[fieldname] = parseInt(val) : data[fieldname] = val;
					});
					busboy.on('finish', function() {
						var valid = validator({
							first_name: {type:"string", required:true},
							last_name: {type:"string", required:true},
							old_password: {type:"string", required:false},
							new_password: {type:"string", required:false},
							username: {type:"string", required:true},
							email: {type:"string", required:true},
							mimetype: {type:"string", required:false},
							city: {type:"string", required:false},
							country: {type:"string", required:false},
							description: {type:"string", required:false},
							age: {type:"number", required:false}
						}, data);

						if (valid != "") { // INVALID
							res.status(500).send({ error: valid })
						} else { // VALID
							if (data.old_password && data.new_password) {
								if (passwordHash.verify(data.old_password, user.password)) {
									data.password = passwordHash.generate(data.new_password);
								} else {
									res.status(500).send({error: "Old password doesn't match!"});
									return ;
								}
							}

							Object.keys(data).map((key)=> {
								if (key != "_id" && key!="old_password" && key!="new_password") {
									user[key] = data[key];
								}
							});

							user.save(function (err, u) {
								if (err)
									res.status(500).send({error: err});
								else
									res.json(u); //success
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


//return MY MAP (locations I've been to)
router.get('/map/:id', function (req,res) {
	Review.find({user_id: req.params.id}, function (err,revs) {
		if (err)
			res.status(500).send({error: err});
		else {
			var loc_arr = [];
			revs.map(function(row) {
				loc_arr.push( new mongoose.Types.ObjectId(row.location));
			});

			Location.find({_id: {$in: loc_arr}}, function(err,locs) {
				if (err)
					res.status(500).send({error: err});
				else
					res.json(locs);
			});
		}
	});
});

// return all users
router.get('/',function(req, res) {
	var find = {};
	var sort = {};
	if (req.query.search) {
        find = { "$text": { "$search":  req.query.search}},{ score: { $meta: "textScore" }};
	}
	if (req.query.sort) {
		if (req.query.sort === 'name')
			sort = {first_name:1,last_name:1};
		else if (req.query.sort === 'date')
			sort = {date_added:-1};
	}


	User.find(find).sort(sort).exec(function(err, u) {
		if (err)
			res.status(500).send({ error: err })
		else
			res.json(u);
	});
});
// return user by username
router.get('/search/:search', function(req, res) {
	User.find({ "$text": { "$search":  req.params.search}},{ score: { $meta: "textScore" }}).exec(function (err, u) {
		if (err)
			res.status(500).send({error: err});
		else if (u.length==0)
			res.status(500).send({error:"No matches"});
		else {
			var max = u[0].score;
			var x = true;
			u.map((row) => {
				if (row.score > max) {
					res.json([row]);
					x = false;
				} else if (max > row.score) {
					res.json([row]);
					x = false;
				}
			});
			if (x)
				res.json(u);
		}
	});
});
// return single user
router.get('/:u_id',function(req, res) {
	User.findById(req.params.u_id, function(err, u) {
		if (err)
			res.status(500).send({ error: err });
		else if (!u)
			res.status(500).send({error: "User doesn't exist"});
		else
			res.json(u);
	});
});

router.get('/decode/:path', function(req,res) {
    var path = "server/audios/"+req.params.path+".wav";
    readFile(path).then(function(buffer) {
        return WavDecoder.decode(buffer);
	}).then(function(audioData) {
		var channel = audioData.channelData[0];

        var bytes_write = new Uint8Array(channel.length+2); // Uint16Array
        bytes_write[0] = audioData.sampleRate / 1000; // pregolema vrednost za Uint8
        bytes_write[1] = audioData.numberOfChannels;
        for (var i=0, ind=2; i<channel.length; i++, ind++) {
            bytes_write[ind] = uLaw.F(channel[i], false);
        }
        fs.writeFile("server/audios/"+req.params.path+".bin", new Buffer(bytes_write), function (err) {
            if (err) {
                throw err;
            }
            console.log("Saved: server/audios/"+req.params.path+".bin");
            //res.json(bytes_write);
            res.json(audioData);
        });

        //console.log(audioData.channelData[1]); // Float32Array
    });
});

router.get('/compress/:path', function(req,res) {
    var reader = new wav.Reader();
    var path = "server/audios/"+req.params.path+".wav";
    var input = fs.createReadStream(path);
    input.pipe(reader);
    reader.once('readable', function () {
        console.log('Bits Per Sample Point:\t%d', reader.bitDepth);
        var readData = reader._readableState.buffer[0];
        res.json(readData);
/*
        var bytes_write = new Uint8Array(readData.length+2); // Uint16Array
        bytes_write[0] = reader.sampleRate / 1000; // pregolema vrednost za Uint8
        bytes_write[1] = reader.channels;
        for (var i=0, ind=2; i<readData.length; i++, ind++) {
            //var r = uLaw.F(readData[i]);
            // ?? 16b -> 8b ??
            bytes_write[ind] = uLaw.F(readData[i], true);
        }
        fs.writeFile("server/audios/"+req.params.path+".bin", new Buffer(bytes_write), function (err) {
            if (err) {
                throw err;
            }
            console.log("Saved: server/audios/"+req.params.path+".bin");
            res.json(bytes_write);
        });
        */
    });
});

//login user
router.post('/login', function(req, res) {
	var body = JSON.parse(req.text);
	//check if a user with the given email/username exists
	var q=User.findOne({$or: [{'email':body.user}, {'username':body.user}]});
	q.exec(function(err,u) {
        if (err){
			req.session.user="";
            res.status(500).send({ error: err })
		}
		else if(u==null){
			req.session.user="";
			res.status(500).send({ error: "Wrong username/email!"});
		}
		else {
			//check if the passwords match
			if (passwordHash.verify(body.password, u.password)) {
				req.session.user=u;

                fs.readFile("server/audios/welcome.bin", function (err, data) {
                    if (err) {
                    	res.json(u);
                        //res.status(500).send({error: err});
                        throw err;
                    }

                    var send_buffer = [];//
                    for (var z = 0; z < data.length; z++) {
                    	send_buffer[z] = (parseInt(data[z]) > 127 && z > 1) ? parseInt(data[z])-256 : parseInt(data[z]);
                    }

                    var res_data = {_id: u._id, buffer: send_buffer};
                    res.json(res_data);
                });
			}else {
				req.session.user="";
				res.status(500).send({ error: "Wrong password!"});
			}
		}
    });	
});
//logout user
router.post('/logout', function(req, res) {
	if (req.session.user==null) {
		res.status(500).send({error: "User not logged in"});
	} else {
		req.session.user=null;

        fs.readFile("server/audios/goodbye.bin", function (err, data) {
            if (err) {
                res.json({msg:"OK"});
                //res.status(500).send({error: err});
                throw err;
            }

            var send_buffer = [];
            for (var z = 0; z < data.length; z++) {
                send_buffer[z] = (parseInt(data[z]) > 127 && z > 1) ? parseInt(data[z])-256 : parseInt(data[z]);
            }

            res.json({msg:"OK", buffer:send_buffer});
        });

	}
});

//delete user
router.delete('/:id', function(req,res){
	if (req.session.user==null) {
		res.status(500).send({error: "User not logged in!"});
	} else {
		User.findOne({"_id":req.params.id},function(err, u) {
			if (err)
				res.status(500).send({ error: err });
			else if(!u) {
				res.status(500).send({ error: "User doesn't exist"});
			}
			else {
				if (u._id == req.session.user._id || req.session.user.type == "admin") {
					u.remove(function (err) {
						if (err)
							res.status(500).send({error: err});
						else {
							res.json({msg: "OK"});
						}
					});
				} else {
					res.status(500).send({ error: "Current user doesn't have permission for this action"});
				}
			}
		});
	}

});

	
module.exports=router;
