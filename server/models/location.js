//scheme for location
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var commentScheme = new Schema({
    comment : {type: String, required: true},
    user_id : {type: String, required: true},
    date_added : {type: Date, default: Date.now()}
});


var scheme = {
    city: {type:String, required:true},
    description: {type:String, required:true},
    votes: {type:Number, required:false, default:0},
    score: {type:Number, required:false, default:0},
    rating: {type:Number, required:false, default:0},
    country: {type:String, required:true},
    latitude: {type:Number, required:false},
    longitude: {type:Number, required:false},
    comments: {type: [commentScheme], required: false},
    pictures: {type: [String], required: false}
};
var LocationSchema = new Schema(scheme);
LocationSchema.index({
    "city": "text",
    "country": "text"
});

module.exports = mongoose.model('locations', LocationSchema);