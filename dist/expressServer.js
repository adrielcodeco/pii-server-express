"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var util_1 = __importDefault(require("util"));
var body_parser_1 = __importDefault(require("body-parser"));
var express_session_1 = __importDefault(require("express-session"));
var compression_1 = __importDefault(require("compression"));
var helmet_1 = __importDefault(require("helmet"));
var v4_1 = __importDefault(require("uuid/v4"));
var di_1 = require("@pii/di");
var morgan_1 = __importDefault(require("morgan"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var application_1 = require("@pii/application");
var expressRouter_1 = require("./expressRouter");
var winston = require('winston');
var ExpressJS = require('express');
var ExpressServer = (function (_super) {
    __extends(ExpressServer, _super);
    function ExpressServer(options) {
        var _this = this;
        if (!options) {
            options = {
                disable_viewcache: false,
                compress_response: true
            };
        }
        _this = _super.call(this, options) || this;
        _this.getLogTransports();
        _this.log = di_1.Container.get(application_1.LoggerToken) || new application_1.FakeLogger();
        _this.express = ExpressJS();
        return _this;
    }
    ExpressServer.prototype.getLogTransports = function () {
        var consoleTransport = new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        });
        di_1.Container.addSingleton(application_1.LogTransportToken, consoleTransport);
    };
    ExpressServer.prototype.prepare = function () {
        return __awaiter(this, void 0, void 0, function () {
            var redis, ioRedis, RedisStore;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.options.viewDir) {
                    this.express.set('views', this.options.viewDir);
                }
                if (this.options.viewEngine) {
                    this.express.set('view engine', this.options.viewEngine);
                }
                if (this.options.environment === 'production') {
                    this.express.use(morgan_1.default(this.logFormatter, {
                        stream: this.log.stream
                    }));
                }
                else {
                    this.express.use(morgan_1.default('dev', {
                        stream: this.log.stream
                    }));
                }
                this.express.use(body_parser_1.default.json());
                this.express.use(body_parser_1.default.urlencoded({ extended: false }));
                if (this.options.cookie_secret) {
                    this.express.use(cookie_parser_1.default(this.options.cookie_secret));
                }
                if (this.options.publicDirs && this.options.publicDirs instanceof Array) {
                    this.options.publicDirs.forEach(function (p) {
                        _this.express.use(ExpressJS.static(p));
                    });
                }
                if (this.options.environment === 'production') {
                    this.express.set('trust proxy', 1);
                }
                if (this.options.session_secret) {
                    redis = void 0;
                    if (this.options.useFakeRedis || !this.options.redis) {
                        redis = require('fakeredis').createClient();
                    }
                    else {
                        ioRedis = require('ioredis');
                        redis = new ioRedis(this.options.redis);
                    }
                    RedisStore = require('connect-redis')(express_session_1.default);
                    this.express.use(express_session_1.default({
                        store: new RedisStore({
                            client: redis,
                            prefix: this.options.redis_prefix
                        }),
                        secret: this.options.session_secret || "magma-secret" + v4_1.default(),
                        name: this.options.session_name,
                        resave: true,
                        saveUninitialized: true,
                        rolling: true,
                        cookie: {
                            httpOnly: this.options.sessionHttpOnly || true,
                            secure: this.options.sessionSecure || false,
                            sameSite: this.options.sessionSameSite || true
                        }
                    }));
                }
                this.express.use(helmet_1.default());
                this.express.disable('x-powered-by');
                return [2];
            });
        });
    };
    ExpressServer.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requestExtensions, routers;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.authentication()];
                    case 1:
                        _a.sent();
                        this.express.use(this.initialLocals.bind(this));
                        if (this.options.disable_viewcache) {
                            this.express.set('view cache', false);
                        }
                        if (this.options.compress_response) {
                            this.express.use(compression_1.default());
                        }
                        requestExtensions = di_1.Container.getServices(application_1.RequestExtensionToken);
                        requestExtensions.forEach(function (ext) {
                            _this.express.use(ext);
                        });
                        return [4, this.loadRoutes()];
                    case 2:
                        _a.sent();
                        routers = di_1.Container.getServices(expressRouter_1.ExpressRouterToken);
                        if (routers && routers.length > 0) {
                            routers.forEach(function (router) { return router.init(_this.express); });
                        }
                        return [2];
                }
            });
        });
    };
    ExpressServer.prototype.loadRoutes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2];
            });
        });
    };
    ExpressServer.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log.info("Express Server Starting");
                        return [4, this.prepare()];
                    case 1:
                        _a.sent();
                        return [4, this.init()];
                    case 2:
                        _a.sent();
                        if (!this.options.port) {
                            throw new application_1.Exception({
                                message: 'server.options.port cannot be null'
                            });
                        }
                        return [4, new Promise(function (resolve, reject) {
                                try {
                                    _this.serverInstance = _this.express.listen(_this.options.port, function () {
                                        try {
                                            var projectName = require(path_1.default.resolve(process.cwd(), './package.json')).name;
                                            _this.log.info(projectName + " started on port " + ((_this.serverInstance || { address: function () { return ({}); } }).address() || {}).port);
                                            resolve();
                                        }
                                        catch (err) {
                                            reject(new application_1.Exception({ details: err }));
                                        }
                                    });
                                }
                                catch (err) {
                                    reject(new application_1.Exception({ details: err }));
                                }
                            }).catch(function (err) { return Promise.reject(err); })];
                    case 3:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    ExpressServer.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.serverInstance) return [3, 2];
                        return [4, util_1.default.promisify(this.serverInstance.close)()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2];
                }
            });
        });
    };
    ExpressServer.prototype.logFormatter = function (tokens, req, res) {
        if (!tokens)
            throw new application_1.Exception({ message: 'tokens param required' });
        if (!tokens.method) {
            throw new application_1.Exception({ message: 'token.method is not a function' });
        }
        if (!tokens.url) {
            throw new application_1.Exception({ message: 'token.url is not a function' });
        }
        if (!tokens.status) {
            throw new application_1.Exception({ message: 'token.status is not a function' });
        }
        if (!tokens.res) {
            throw new application_1.Exception({ message: 'token.res is not a function' });
        }
        if (!tokens['response-time']) {
            throw new application_1.Exception({
                message: 'token.response-time is not a function'
            });
        }
        return JSON.stringify({
            type: 'request',
            method: tokens.method(req, res),
            url: tokens.url(req, res),
            status: tokens.status(req, res),
            contentLength: tokens.res(req, res, 'content-length'),
            responseTime: (tokens['response-time'](req, res) || '-- ') + 'ms'
        });
    };
    ExpressServer.prototype.errorHandler = function (router) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!router)
                    throw new application_1.Exception({ message: 'router param required' });
                router.use(function (err, req, res, next) {
                    if (req.xhr)
                        res.status(500).send({ error: err });
                    else
                        next(err);
                });
                router.use(function (req, res, next) {
                    var err = new Error("Not Found : " + req.url);
                    err.status = 404;
                    next(err);
                });
                if (this.options.environment !== 'production' &&
                    this.options.environment !== 'stage') {
                    router.use(function (err, req, res) {
                        _this.log.debug(err);
                        res.status(err.status || 500);
                        res.render('error', {
                            message: err.message,
                            error: err,
                            title: 'Error'
                        });
                    });
                }
                router.use(function (err, req, res) {
                    if (err.status === 404) {
                        res.status(404);
                        return res.render('404');
                    }
                    res.status(500);
                    res.render('500');
                });
                return [2];
            });
        });
    };
    ExpressServer.prototype.initialLocals = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, new Promise(function (resolve) {
                            process.nextTick(function () {
                                if (!res) {
                                    resolve();
                                    return void (!!next && next());
                                }
                                if (!res.locals)
                                    res.locals = {};
                                if (req && req.headers) {
                                    res.locals.url = req.protocol + '://' + req.headers.host + req.url;
                                }
                                res.locals.env = _this.options.environment;
                                resolve();
                                return void (!!next && next());
                            });
                        })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    ExpressServer.prototype.authentication = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2];
            });
        });
    };
    return ExpressServer;
}(application_1.Server));
exports.ExpressServer = ExpressServer;

//# sourceMappingURL=expressServer.js.map
