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
var UserService = (function () {
    function UserService(http) {
        this.http = http;
    }
    UserService.prototype.register = function (data) {
        return this.http.post('http://localhost:8080/user', data)
            .map(function (res) { return res.json(); });
    };
    UserService.prototype.getMap = function (id) {
        return this.http.get('http://localhost:8080/user/map/' + id)
            .map(function (res) { return res.json(); });
    };
    UserService.prototype.editUser = function (data, id) {
        return this.http.put('http://localhost:8080/user/' + id, data, { withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    UserService.prototype.logIn = function (user, pass) {
        var headers = new http_1.Headers({ 'Content-Type': 'text/plain; charset=UTF-8' });
        return this.http.post('http://localhost:8080/user/login', { 'user': user, 'password': pass }, { headers: headers, withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    UserService.prototype.logOut = function () {
        var headers = new http_1.Headers({ 'Content-Type': 'text/plain; charset=UTF-8', });
        return this.http.post('http://localhost:8080/user/logout', {}, { headers: headers, withCredentials: true })
            .map(function (res) { return res.json(); });
    };
    UserService.prototype.getUser = function (id) {
        var url = 'http://localhost:8080/user/' + id;
        return this.http.get(url)
            .map(function (res) { return res.json(); });
    };
    UserService.prototype.getAllUsers = function () {
        return this.http.get('http://localhost:8080/user')
            .map(function (res) { return res.json(); });
    };
    return UserService;
}());
UserService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map
