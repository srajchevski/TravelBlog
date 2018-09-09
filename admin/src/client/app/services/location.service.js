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
var LocationService = (function () {
    function LocationService(http) {
        this.http = http;
    }
    LocationService.prototype.getLocation = function (id) {
        var url = 'http://localhost:8080/location/' + id;
        return this.http.get(url)
            .map(function (res) { return res.json(); });
    };
    LocationService.prototype.getLocations = function (search, sort, limit) {
        if (search === void 0) { search = ""; }
        if (sort === void 0) { sort = ""; }
        if (limit === void 0) { limit = 0; }
        var query = "?search=" + search + "&sort=" + sort + "&limit=" + limit;
        var url = 'http://localhost:8080/location' + query;
        return this.http.get(url)
            .map(function (res) { return res.json(); });
    };
    LocationService.prototype.rateLocation = function (num, id) {
        var url = 'http://localhost:8080/location/rating/' + id;
        return this.http.put(url, { rating: num }, { withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    LocationService.prototype.getLikes = function (id) {
        var url = 'http://localhost:8080/location/votes/' + id;
        return this.http.get(url, { withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    LocationService.prototype.postComment = function (comment, id) {
        var url = 'http://localhost:8080/location/comment/' + id;
        return this.http.put(url, { comment: comment }, { withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    LocationService.prototype.removeComment = function (story_id, comment_id) {
        var url = 'http://localhost:8080/location/delete_comment/' + story_id;
        return this.http.put(url, { comment_id: comment_id }, { withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    return LocationService;
}());
LocationService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], LocationService);
exports.LocationService = LocationService;
//# sourceMappingURL=location.service.js.map
