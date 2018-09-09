"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
require("rxjs/add/operator/map");
var StoryService = (function () {
    function StoryService(http) {
        this.http = http;
    }
    StoryService.prototype.incrementViews = function (id) {
        return this.http.put('http://localhost:8080/review/views/' + id, {})
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.createStory = function (data) {
        return this.http.post('http://localhost:8080/review', data, { withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.editStory = function (data, id) {
        return this.http.put('http://localhost:8080/review/' + id, data, { withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.getStoriesByUser = function (id) {
        return this.http.get('http://localhost:8080/review?user_id=' + id)
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.getStory = function (id) {
        var url = 'http://localhost:8080/review/' + id;
        console.log(url);
        return this.http.get(url)
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.getStoriesGeo = function (lat, lon, limit, max) {
        if (limit === void 0) { limit = 0; }
        if (max === void 0) { max = 550; }
        var query = "?lat=" + lat + "&lon=" + lon + "&limit=" + limit + "&max=" + max;
        var url = 'http://localhost:8080/review/geo' + query;
        return this.http.get(url)
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.getStoriesLikes = function (id, limit, max) {
        if (limit === void 0) { limit = 6; }
        if (max === void 0) { max = 600; }
        var query = "?limit=" + limit + "&max=" + max;
        var url = 'http://localhost:8080/review/by_rating/' + id + query;
        return this.http.get(url, { withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.getStories = function (search, sort, limit) {
        if (search === void 0) { search = ""; }
        if (sort === void 0) { sort = ""; }
        if (limit === void 0) { limit = 0; }
        var query = "?" + search + "&sort=" + sort + "&limit=" + limit;
        var url = 'http://localhost:8080/review' + query;
        return this.http.get(url)
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.getTrendingStories = function () {
        var url = 'http://localhost:8080/review/trending';
        return this.http.get(url)
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.getLike = function (id) {
        var url = 'http://localhost:8080/review/votes/' + id;
        return this.http.get(url, { withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.rate = function (id) {
        var url = 'http://localhost:8080/review/rating/' + id;
        return this.http.put(url, {}, { withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.postComment = function (comment, id) {
        var url = 'http://localhost:8080/review/comment/' + id;
        return this.http.put(url, { comment: comment }, { withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.removeComment = function (story_id, comment_id) {
        var url = 'http://localhost:8080/review/delete_comment/' + story_id;
        return this.http.put(url, { comment_id: comment_id }, { withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    StoryService.prototype.removeStory = function (id) {
        var url = 'http://localhost:8080/review/' + id;
        return this.http.delete(url, { withCredentials: true });
    };
    return StoryService;
}());
StoryService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], StoryService);
exports.StoryService = StoryService;
//# sourceMappingURL=story.service.js.map
