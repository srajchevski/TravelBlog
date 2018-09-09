//scheme for keeping track of ratings
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var scheme = {
    location: {type:String, required:true},
    date_added: {type: Date, default:Date.now()}
};
var LocationViewSchema = new Schema(scheme);

module.exports = mongoose.model('location_views', LocationViewSchema);