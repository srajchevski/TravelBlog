//scheme for keeping track of ratings
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var scheme = {
    user: {type:String, required:true},
    location: {type:String, required:true},
    rating: {type: Number, required: true}
};
var LocSchema = new Schema(scheme);

module.exports = mongoose.model('location_ratings', LocSchema);