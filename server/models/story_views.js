//scheme for keeping track of ratings
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var scheme = {
    review: {type:String, required:true},
    date_added: {type: Date, default:Date.now()}
};
var StoryViewSchema = new Schema(scheme);

module.exports = mongoose.model('story_views', StoryViewSchema);