"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.PlatformWithTop = exports.Platform = void 0;
var Platform = /** @class */ (function () {
    function Platform(api, platform) {
        this.api = api;
        this.platform = platform;
    }
    /**
     * Returns data about a given user
     *
     * Remember that extended and archive history cost more credits.
     * Find out more at https://socialblade.com/b/docs/user
     */
    Platform.prototype.user = function (query, history) {
        if (history === void 0) { history = 'default'; }
        return __awaiter(this, void 0, void 0, function () {
            var req;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.get(this.platform + "/statistics", {
                            query: query,
                            history: history
                        })];
                    case 1:
                        req = _a.sent();
                        if (!req.status.success)
                            throw req.status.error;
                        return [2 /*return*/, req.data];
                }
            });
        });
    };
    return Platform;
}());
exports.Platform = Platform;
// Not all platform support top lists at this current time.
// We seperate the Platform and extend with Top that way we can
// use the same base class for all platforms.
var PlatformWithTop = /** @class */ (function (_super) {
    __extends(PlatformWithTop, _super);
    function PlatformWithTop(api, platform, defaultFilter) {
        var _this = _super.call(this, api, platform) || this;
        _this.defaultFilter = defaultFilter;
        return _this;
    }
    /**
     * Returns top list for a given filter
     * Starting from page 1, each response has 100 users which can then be accessed for 24 hours.
     * You can then iterate through the pages you wish to get more results
     *
     * Credit break down can be found at https://socialblade.com/b/docs/top-general
     */
    PlatformWithTop.prototype.top = function (query, page) {
        if (query === void 0) { query = this.defaultFilter; }
        if (page === void 0) { page = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var req;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.get(this.platform + "/top", {
                            query: query,
                            page: page
                        })];
                    case 1:
                        req = _a.sent();
                        if (!req.status.success)
                            throw req.status.error;
                        return [2 /*return*/, req.data];
                }
            });
        });
    };
    return PlatformWithTop;
}(Platform));
exports.PlatformWithTop = PlatformWithTop;
