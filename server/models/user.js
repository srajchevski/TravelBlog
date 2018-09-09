//scheme for user
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var scheme = {
	first_name: {type:String, required:true},
	last_name: {type:String, required:true},
	password: {type:String, required:true},
	username: {type:String, required:true},
	email: {type:String, required:true},
	profile_picture: {type:String, required:false, default:"https://museum.wales/media/40374/thumb_480/empty-profile-grey.jpg"},
	mimetype: {type:String, required:false},
	location: {type:String, required:false},
	description: {type:String, required:false},
	type: {type:String, default:"regular"},
	age: {type:Number, required:false},
	date_added: {type:Date, default:Date.now()}
};
var UserSchema   = new Schema(scheme);
UserSchema.index({
	"username": "text",
	"first_name": "text",
	"last_name": "text",
	"email": "text"
});
module.exports = mongoose.model('users', UserSchema);