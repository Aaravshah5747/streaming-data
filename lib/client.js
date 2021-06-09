"use strict";
exports.__esModule = true;
var matrix_1 = require("./matrix");
var platform_1 = require("./platform");
var SocialBlade = /** @class */ (function () {
    function SocialBlade(client_id, access_token, options) {
        if (options === void 0) { options = {}; }
        this.api = new matrix_1.Matrix(client_id, access_token, options);
        this.instagram = new platform_1.PlatformWithTop(this.api, 'instagram', 'followers');
        this.youtube = new platform_1.PlatformWithTop(this.api, 'youtube', 'subscribers');
        this.facebook = new platform_1.PlatformWithTop(this.api, 'facebook', 'likes');
        this.twitter = new platform_1.PlatformWithTop(this.api, 'twitter', 'followers');
        this.twitch = new platform_1.PlatformWithTop(this.api, 'twitch', 'followers');
        this.tiktok = new platform_1.PlatformWithTop(this.api, 'tiktok', 'followers');
        this.dailymotion = new platform_1.Platform(this.api, 'dailymotion');
        this.storyfire = new platform_1.Platform(this.api, 'storyfire');
        this.dlive = new platform_1.Platform(this.api, 'dlive');
        this.trovo = new platform_1.Platform(this.api, 'trovo');
    }
    return SocialBlade;
}());
exports["default"] = SocialBlade;
