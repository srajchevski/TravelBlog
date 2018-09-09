//scheme for keeping track of ratings
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var scheme = {
    user: {type:String, required:true},
    review: {type:String, required:true}
    //rating: {type: Number, required: true}
};
var ReviewSchema = new Schema(scheme);

module.exports = mongoose.model('ratings', ReviewSchema);