"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var client_1 = require("./client");
exports["default"] = client_1["default"];
// Interfaces
__exportStar(require("./interfaces/matrix"), exports);
__exportStar(require("./interfaces/options"), exports);
// Platforms
__exportStar(require("./interfaces/dailymotion"), exports);
__exportStar(require("./interfaces/storyfire"), exports);
__exportStar(require("./interfaces/instagram"), exports);
__exportStar(require("./interfaces/facebook"), exports);
__exportStar(require("./interfaces/youtube"), exports);
__exportStar(require("./interfaces/twitter"), exports);
__exportStar(require("./interfaces/twitch"), exports);
__exportStar(require("./interfaces/tiktok"), exports);
__exportStar(require("./interfaces/dlive"), exports);
__exportStar(require("./interfaces/trovo"), exports);
module.exports = client_1["default"];
