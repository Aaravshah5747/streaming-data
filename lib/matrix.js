"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.Matrix = void 0;
var Matrix = /** @class */ (function () {
    function Matrix(client_id, access_token, _a) {
        var base_url = _a.base_url, user_agent = _a.user_agent;
        this.base_url = "https://matrix.sbapis.com/b/";
        this.user_agent = 'Social Blade TypeScript Library :: SocialBlade/socialblade-js';
        this.client_id = client_id;
        this.access_token = access_token;
        if (base_url)
            this.base_url = base_url;
        if (user_agent)
            this.user_agent = user_agent;
    }
    Matrix.prototype.request = function (method, _a) {
        var path = _a.path, data = _a.data, headers = _a.headers;
        return __awaiter(this, void 0, void 0, function () {
            var qs;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        qs = "?" + Object.keys(data)
                            .map(function (key) { return key + '=' + data[key]; })
                            .join('&');
                        return [4 /*yield*/, fetch("" + this.base_url + path + (method === 'GET' ? qs : ''), {
                                method: method,
                                body: method !== 'GET' ? data : null,
                                headers: __assign(__assign({}, headers), { clientid: this.client_id, token: this.access_token, 'User-Agent': this.user_agent })
                            }).then(function (data) { return data.json(); })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    Matrix.prototype.get = function (path, data, headers) {
        if (data === void 0) { data = {}; }
        if (headers === void 0) { headers = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('GET', { path: path, data: data, headers: headers })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Matrix;
}());
exports.Matrix = Matrix;
