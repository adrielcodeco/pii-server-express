/**
 * Copyright 2018-present, CODECO. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path'
import http from 'http'
import util from 'util'
import bodyParser from 'body-parser'
import session from 'express-session'
import compress from 'compression'
import helmet from 'helmet'
import uuid from 'uuid/v4'
import { Container } from '@pii/di'
import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import {
  Server,
  Exception,
  ILogger,
  LoggerToken,
  FakeLogger,
  LogTransportToken,
  RequestExtensionToken
} from '@pii/application'
import { ExpressRouter, ExpressRouterToken } from './expressRouter'
import { ExpressServerOptions } from './expressServerOptions'
const winston = require('winston')
const ExpressJS = require('express')

export type RequestExtension = (req: any, res: any, next: Function) => void

export class ExpressServer extends Server<http.Server, ExpressServerOptions> {
  public express: express.Express

  protected log: ILogger

  constructor (options?: ExpressServerOptions) {
    if (!options) {
      options = {
        disable_viewcache: false,
        compress_response: true
      } as ExpressServerOptions
    }
    super(options)
    this.getLogTransports()
    this.log = Container.get<ILogger>(LoggerToken) || new FakeLogger()
    this.express = ExpressJS()
  }

  public getLogTransports () {
    const consoleTransport = new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
    Container.addSingleton(LogTransportToken, consoleTransport)
  }

  public async prepare (): Promise<void> {
    // i18next
    //   .use(middleware.LanguageDetector)
    //   .init(require('#config/i18n'))
    if (this.options.viewDir) {
      this.express.set('views', this.options.viewDir)
    }
    if (this.options.viewEngine) {
      this.express.set('view engine', this.options.viewEngine)
    }
    // this.server.use(favicon(path.resolve(this.options.publicDir, './img/favicon.ico')))
    if (this.options.environment === 'production') {
      this.express.use(morgan(this.logFormatter, {
        stream: this.log.stream
      }) as any)
    } else {
      this.express.use(morgan('dev', {
        stream: this.log.stream
      }) as any)
    }

    this.express.use(bodyParser.json())
    this.express.use(bodyParser.urlencoded({ extended: false }))
    if (this.options.cookie_secret) {
      this.express.use(cookieParser(this.options.cookie_secret) as any)
    }
    if (this.options.publicDirs && this.options.publicDirs instanceof Array) {
      this.options.publicDirs.forEach(p => {
        this.express.use(ExpressJS.static(p))
      })
    }

    if (this.options.environment === 'production') {
      this.express.set('trust proxy', 1)
    }

    if (this.options.session_secret) {
      let redis
      if (this.options.useFakeRedis || !this.options.redis) {
        redis = require('fakeredis').createClient()
      } else {
        const ioRedis = require('ioredis')
        redis = new ioRedis(this.options.redis)
      }
      const RedisStore = require('connect-redis')(session)
      this.express.use(session({
        store: new RedisStore({
          client: redis,
          prefix: this.options.redis_prefix
        }),
        secret: this.options.session_secret || `magma-secret${uuid()}`,
        name: this.options.session_name,
        resave: true,
        saveUninitialized: true,
        rolling: true,
        cookie: {
          httpOnly: this.options.sessionHttpOnly || true,
          secure: this.options.sessionSecure || false,
          sameSite: this.options.sessionSameSite || true
        }
      }) as any)
    }

    // this.server.use(middleware.handle(i18next, {
    //   ignoreRoutes: ["/foo"],
    //   removeLngFromUrl: false
    // }))

    // Use helmet to secure Express headers
    // this.server.use(helmet.xframe())
    // this.server.use(helmet.xssFilter())
    // this.server.use(helmet.nosniff())
    // this.server.use(helmet.ienoopen())
    this.express.use(helmet())
    this.express.disable('x-powered-by')
  }

  public async init (): Promise<void> {
    await this.authentication()

    this.express.use(this.initialLocals.bind(this))

    // Environment dependent middleware

    if (this.options.disable_viewcache) {
      this.express.set('view cache', false)
    }

    if (this.options.compress_response) {
      // Should be placed before express.static
      this.express.use(compress())
    }

    const requestExtensions = Container.getServices<RequestExtension>(
      RequestExtensionToken
    )
    requestExtensions.forEach(ext => {
      this.express.use(ext)
    })

    // let RateLimit = require('express-rate-limit')

    // let siteLimiter = new RateLimit({
    //     windowMs: 15 * 60 * 1000, // 15 minutes
    //     max: 100,
    //     delayMs: 0 // disabled
    // })

    // this.server.use(siteLimiter)

    // routingUseContainer(Container)
    // ormUseContainer(Container)

    await this.loadRoutes()

    const routers = Container.getServices<ExpressRouter>(ExpressRouterToken)
    if (routers && routers.length > 0) {
      routers.forEach(router => router.init(this.express))
    }

    // await this.errorHandler(this.server)
  }

  public async loadRoutes (): Promise<void> {
    // does nothing
  }

  public async start (): Promise<void> {
    this.log.info(`Express Server Starting`)
    await this.prepare()
    await this.init()

    if (!this.options.port) {
      throw new Exception({
        message: 'server.options.port cannot be null'
      })
    }

    await new Promise((resolve, reject) => {
      try {
        this.serverInstance = this.express.listen(this.options.port, () => {
          try {
            const projectName = require(path.resolve(
              process.cwd(),
              './package.json'
            )).name
            this.log.info(
              `${projectName} started on port ${
                (
                  (
                    this.serverInstance || ({ address: () => ({}) } as any)
                  ).address() || ({} as any)
                ).port
              }`
            )
            resolve()
          } catch (err) {
            reject(new Exception({ details: err }))
          }
        })
      } catch (err) {
        reject(new Exception({ details: err }))
      }
    }).catch(err => Promise.reject(err))
  }

  public async stop (): Promise<void> {
    if (this.serverInstance) {
      await util.promisify(this.serverInstance.close)()
    }
  }

  protected logFormatter (
    tokens: any,
    req: express.Request,
    res: express.Response
  ): string {
    if (!tokens) throw new Exception({ message: 'tokens param required' })
    if (!tokens.method) {
      throw new Exception({ message: 'token.method is not a function' })
    }
    if (!tokens.url) {
      throw new Exception({ message: 'token.url is not a function' })
    }
    if (!tokens.status) {
      throw new Exception({ message: 'token.status is not a function' })
    }
    if (!tokens.res) {
      throw new Exception({ message: 'token.res is not a function' })
    }
    if (!tokens['response-time']) {
      throw new Exception({
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

  public async errorHandler (router: express.Router): Promise<void> {
    if (!router) throw new Exception({ message: 'router param required' })

    router.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        if (req.xhr) res.status(500).send({ error: err })
        else next(err)
      }
    )

    // catch 404 and forward to error handler
    router.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        const err: any = new Error(`Not Found : ${req.url}`)
        err.status = 404
        next(err)
      }
    )

    // development error handler
    // will print stacktrace
    if (
      this.options.environment !== 'production' &&
      this.options.environment !== 'stage'
    ) {
      router.use((err: any, req: express.Request, res: express.Response) => {
        this.log.debug(err)
        res.status(err.status || 500)
        res.render('error', {
          message: err.message,
          error: err,
          title: 'Error'
        })
      })
    }

    // production error handler
    // no stacktraces leaked to user
    router.use((err: any, req: express.Request, res: express.Response) => {
      if (err.status === 404) {
        res.status(404)
        return res.render('404')
      }
      res.status(500)
      res.render('500')
    })
  }

  public async initialLocals (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    await new Promise(resolve => {
      process.nextTick(() => {
        if (!res) {
          resolve()
          return void (!!next && next())
        }
        if (!res.locals) res.locals = {}
        if (req && req.headers) {
          res.locals.url = req.protocol + '://' + req.headers.host + req.url
        }
        res.locals.env = this.options.environment
        resolve()
        return void (!!next && next())
      })
    })
  }

  public async authentication (): Promise<void> {
    // does nothing
  }
}
