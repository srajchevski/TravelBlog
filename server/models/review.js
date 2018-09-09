//scheme for review
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var commentScheme = new Schema({
	comment : {type: String, required: true},
	user_id : {type: String, required: true},
	date_added : {type: Date, default: Date.now()}
});

var scheme = {
	title: {type:String, required:true},
	description: {type:String, required:true},
	location: {type:String, required:true},
	user_id: {type:String, required:true},
	rating: {type: Number, required: false, default: 0},
	views: {type: Number, required:false, default: 0},
	pictures: {type: [String], required: false},
	comments: {type: [commentScheme], required: false},
	date_added: {type:Date, default:Date.now()}
};
var ReviewSchema = new Schema(scheme);
ReviewSchema.index({
	"title": "text"
});
module.exports = mongoose.model('reviews', ReviewSchema);