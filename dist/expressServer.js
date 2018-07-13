'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled (value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected (value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step (result) {
        result.done
          ? resolve(result.value)
          : new P(function (resolve) {
            resolve(result.value)
          }).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
Object.defineProperty(exports, '__esModule', { value: true })
const path = require('path')
const bodyParser = require('body-parser')
const session = require('express-session')
const compress = require('compression')
const helmet = require('helmet')
const uuid = require('uuid/v4')
const di_1 = require('@pii/di')
const express_1 = require('express')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const application_1 = require('@pii/application')
const expressRouter_1 = require('./expressRouter')
const winston = require('winston')
class ExpressServer extends application_1.Server {
  constructor (options) {
    if (!options) {
      options = {
        viewDir: path.resolve(process.cwd(), './views'),
        viewEngine: 'jade',
        publicDirs: path.resolve(process.cwd(), './public'),
        cookie_secret: 'pii-express-server-cookie-secret',
        useFakeRedis: true,
        redis: {},
        redis_prefix: 'pii-express-server-redis-prefix',
        session_name: 'pii-express-server-session-name',
        session_secret: 'pii-express-server-session-secret'
      }
    }
    super(options)
    this.getLogTransports()
    this.log = di_1.Container.get(application_1.LoggerToken) || {}
    this.express = express_1.default()
  }
  getLogTransports () {
    const consoleTransport = new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
    di_1.Container.addSingleton(
      application_1.LogTransportToken,
      consoleTransport
    )
  }
  prepare () {
    return __awaiter(this, void 0, void 0, function * () {
      if (this.options.viewDir) {
        this.express.set('views', this.options.viewDir)
      }
      if (this.options.viewEngine) {
        this.express.set('view engine', this.options.viewEngine)
      }
      this.express.use(
        morgan(this.logFormatter, {
          stream: this.log.stream
        })
      )
      this.express.use(bodyParser.json())
      this.express.use(bodyParser.urlencoded({ extended: false }))
      if (this.options.cookie_secret) {
        this.express.use(cookieParser(this.options.cookie_secret))
      }
      if (this.options.publicDirs && this.options.publicDirs instanceof Array) {
        this.options.publicDirs.forEach(p => {
          this.express.use(express_1.default.static(p))
        })
      }
      this.express.set('trust proxy', 1)
      let redis
      if (this.options.useFakeRedis || !this.options.redis) {
        redis = require('fakeredis').createClient()
      } else {
        const ioRedis = require('ioredis')
        redis = new ioRedis(this.options.redis)
      }
      const RedisStore = require('connect-redis')(session)
      this.express.use(
        session({
          store: new RedisStore({
            client: redis,
            prefix: this.options.redis_prefix
          }),
          secret: this.options.session_secret || `magma-secret${uuid()}`,
          name: this.options.session_name,
          resave: true,
          saveUninitialized: true
        })
      )
      this.express.use(helmet())
      this.express.disable('x-powered-by')
    })
  }
  init () {
    return __awaiter(this, void 0, void 0, function * () {
      yield this.authentication()
      this.express.use(this.initialLocals.bind(this))
      if (
        this.options.environment !== 'production' &&
        this.options.environment !== 'stage'
      ) {
        this.express.set('view cache', false)
      } else {
        this.express.use(compress())
      }
      yield this.loadRoutes()
      const router = di_1.Container.get(expressRouter_1.ExpressRouterToken)
      if (router) {
        router.init(this.express)
      }
    })
  }
  loadRoutes () {
    return __awaiter(this, void 0, void 0, function * () {})
  }
  start () {
    return __awaiter(this, void 0, void 0, function * () {
      yield this.prepare()
      yield this.init()
      if (!this.options.port) {
        throw new application_1.Exception({
          message: 'server.options.port cannot be null'
        })
      }
      yield new Promise((resolve, reject) => {
        try {
          this.serverInstance = this.express.listen(this.options.port, () => {
            const projectName = require(path.resolve(
              process.cwd(),
              './package.json'
            )).name
            this.log.info(
              `${projectName} started on port ${
                (
                  (this.serverInstance || { address: () => ({}) }).address() ||
                  {}
                ).port
              }`
            )
            resolve()
          })
        } catch (err) {
          reject(new application_1.Exception({ details: err }))
        }
      }).catch(err => Promise.reject(err))
    })
  }
  stop () {
    return __awaiter(this, void 0, void 0, function * () {
      !!this.serverInstance && this.serverInstance.close()
    })
  }
  logFormatter (tokens, req, res) {
    if (!tokens) { throw new application_1.Exception({ message: 'tokens param required' }) }
    if (!tokens.method) {
      throw new application_1.Exception({
        message: 'token.method is not a function'
      })
    }
    if (!tokens.url) {
      throw new application_1.Exception({
        message: 'token.url is not a function'
      })
    }
    if (!tokens.status) {
      throw new application_1.Exception({
        message: 'token.status is not a function'
      })
    }
    if (!tokens.res) {
      throw new application_1.Exception({
        message: 'token.res is not a function'
      })
    }
    if (!tokens['response-time']) {
      throw new application_1.Exception({
        message: 'token.response-time is not a function'
      })
    }
    return JSON.stringify({
      type: 'request',
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      contentLength: tokens.res(req, res, 'content-length'),
      responseTime: (tokens['response-time'](req, res) || '-- ') + 'ms'
    })
  }
  errorHandler (router) {
    return __awaiter(this, void 0, void 0, function * () {
      if (!router) { throw new application_1.Exception({ message: 'router param required' }) }
      router.use((err, req, res, next) => {
        if (req.xhr) res.status(500).send({ error: err })
        else next(err)
      })
      router.use((req, res, next) => {
        const err = new Error(`Not Found : ${req.url}`)
        err.status = 404
        next(err)
      })
      if (
        this.options.environment !== 'production' &&
        this.options.environment !== 'stage'
      ) {
        router.use((err, req, res) => {
          this.log.debug(err)
          res.status(err.status || 500)
          res.render('error', {
            message: err.message,
            error: err,
            title: 'Error'
          })
        })
      }
      router.use((err, req, res) => {
        if (err.status === 404) {
          res.status(404)
          return res.render('404')
        }
        res.status(500)
        res.render('500')
      })
    })
  }
  initialLocals (req, res, next) {
    return __awaiter(this, void 0, void 0, function * () {
      if (!res) return void (!!next && next())
      if (!res.locals) res.locals = {}
      if (req && req.headers) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url
      }
      res.locals.env = this.options.environment
      next()
    })
  }
  authentication () {
    return __awaiter(this, void 0, void 0, function * () {})
  }
}
exports.ExpressServer = ExpressServer

//# sourceMappingURL=expressServer.js.map
