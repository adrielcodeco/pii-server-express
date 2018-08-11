/**
 * Copyright 2018-present, CODECO. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {}

const requireTest = () => {
  jest.resetModules()
  return require('../src/expressServer')
}

beforeAll(() => {
  jest.mock('express')
})

afterAll(() => {
  jest.unmock('express')
})

test('require', () => {
  expect.assertions(2)
  const unit = requireTest()
  expect(unit).toHaveProperty('ExpressServer')
  expect(Object.keys(unit).length).toEqual(1)
})

test('new', () => {
  expect.assertions(1)
  const unit = requireTest()
  expect(() => {
    // tslint:disable:nextline no-unused-expression
    new unit.ExpressServer({
      viewDir: './views',
      viewEngine: 'jade',
      publicDirs: './public',
      cookie_secret: 'pii-express-server-cookie-secret',
      useFakeRedis: true,
      redis: {},
      redis_prefix: 'pii-express-server-redis-prefix',
      session_name: 'pii-express-server-session-name',
      session_secret: 'pii-express-server-session-secret'
    })
  }).not.toThrow()
})

test('new without arguments', () => {
  expect.assertions(1)
  const unit = requireTest()
  expect(() => {
    // tslint:disable:nextline no-unused-expression
    new unit.ExpressServer()
  }).not.toThrow()
})

test('new without ILogger', () => {
  expect.assertions(1)
  const unit = requireTest()
  const { Container } = require('@pii/di')
  const { LoggerToken } = require('@pii/application')
  Container.removeSingleton(LoggerToken)
  expect(() => {
    // tslint:disable:nextline no-unused-expression
    new unit.ExpressServer()
  }).not.toThrow()
})

test('call prepare', () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({
    viewDir: './views',
    viewEngine: 'jade',
    publicDirs: ['./public'],
    cookie_secret: 'pii-express-server-cookie-secret',
    useFakeRedis: false,
    redis: {},
    redis_prefix: 'pii-express-server-redis-prefix',
    session_name: 'pii-express-server-session-name',
    session_secret: 'pii-express-server-session-secret'
  })
  return expect(server.prepare()).resolves.toBeUndefined()
})

test('call prepare without this.options', () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  return expect(server.prepare()).resolves.toBeUndefined()
})

test('call init', () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({
    viewDir: './views',
    viewEngine: 'jade',
    publicDirs: ['./public'],
    cookie_secret: 'pii-express-server-cookie-secret',
    useFakeRedis: false,
    redis: {},
    redis_prefix: 'pii-express-server-redis-prefix',
    session_name: 'pii-express-server-session-name',
    session_secret: 'pii-express-server-session-secret',
    environment: 'stage'
  })
  return expect(server.init()).resolves.toBeUndefined()
})

test('call init without this.options', () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  return expect(server.init()).resolves.toBeUndefined()
})

test('call init with routes', async () => {
  expect.assertions(2)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  const { Container } = require('@pii/di')
  const { ExpressRouter, ExpressRouterToken } = require('../src/expressRouter')
  const routerInitFn = jest.fn()
  class Router extends ExpressRouter {
    init () {
      routerInitFn()
    }
  }
  const router = new Router()
  Container.addSingleton(ExpressRouterToken, router)
  await expect(server.init()).resolves.toBeUndefined()
  expect(routerInitFn).toBeCalled()
})

test('call start without port', async () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({
    viewDir: './views',
    viewEngine: 'jade',
    publicDirs: ['./public'],
    cookie_secret: 'pii-express-server-cookie-secret',
    useFakeRedis: false,
    redis: {},
    redis_prefix: 'pii-express-server-redis-prefix',
    session_name: 'pii-express-server-session-name',
    session_secret: 'pii-express-server-session-secret',
    environment: 'stage'
  })
  await expect(server.start()).rejects.toMatchObject({
    message: 'server.options.port cannot be null'
  })
})

test('call start', async () => {
  expect.assertions(3)
  const unit = requireTest()
  const { Container } = require('@pii/di')
  const { FakeLogger, LoggerToken } = require('@pii/application')
  Container.addSingleton(LoggerToken, new FakeLogger())
  const server = new unit.ExpressServer({
    viewDir: './views',
    viewEngine: 'jade',
    publicDirs: ['./public'],
    cookie_secret: 'pii-express-server-cookie-secret',
    useFakeRedis: false,
    redis: {},
    redis_prefix: 'pii-express-server-redis-prefix',
    session_name: 'pii-express-server-session-name',
    session_secret: 'pii-express-server-session-secret',
    environment: 'stage',
    port: 3000
  })
  const serverInstanceAddressFn = jest.fn()
  server.express.listen = jest.fn((port, cb) => {
    setTimeout(cb, 1000)
    return {
      address: serverInstanceAddressFn
    }
  })
  await expect(server.start()).resolves.toBeUndefined()
  expect(serverInstanceAddressFn).toBeCalled()
  expect(server.express.listen).toBeCalled()
})

test('call start without server.serverInstance', async () => {
  expect.assertions(2)
  const unit = requireTest()
  const { Container } = require('@pii/di')
  const { FakeLogger, LoggerToken } = require('@pii/application')
  Container.addSingleton(LoggerToken, new FakeLogger())
  const server = new unit.ExpressServer({
    viewDir: './views',
    viewEngine: 'jade',
    publicDirs: ['./public'],
    cookie_secret: 'pii-express-server-cookie-secret',
    useFakeRedis: false,
    redis: {},
    redis_prefix: 'pii-express-server-redis-prefix',
    session_name: 'pii-express-server-session-name',
    session_secret: 'pii-express-server-session-secret',
    environment: 'stage',
    port: 3000
  })
  server.express.listen = jest.fn((port, cb) => {
    setTimeout(cb, 1000)
    return undefined
  })
  await expect(server.start()).resolves.toBeUndefined()
  expect(server.express.listen).toBeCalled()
})

test('call start failing', async () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({
    port: 3000
  })
  server.express.listen = (port, cb) => {
    throw Error('test')
  }
  await expect(server.start()).rejects.toMatchObject({
    details: expect.anything()
  })
})

test('call stop', async () => {
  expect.assertions(2)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  server.serverInstance = {}
  server.serverInstance.close = jest.fn()
  await expect(server.stop()).resolves.toBeUndefined()
  expect(server.serverInstance.close).toBeCalled()
})

test('call logFormatter without tokens', () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  expect(() => {
    server.logFormatter()
  }).toThrowError(/tokens param required/)
})

test('call logFormatter without tokens.method', () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  expect(() => {
    server.logFormatter({})
  }).toThrowError(/token.method is not a function/)
})

test('call logFormatter without token.url', () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  expect(() => {
    server.logFormatter({ method: 'POST' })
  }).toThrowError(/token.url is not a function/)
})

test('call logFormatter without token.status', () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  expect(() => {
    server.logFormatter({
      method: () => ({}),
      url: () => ({})
    })
  }).toThrowError(/token.status is not a function/)
})

test('call logFormatter without token.res', () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  expect(() => {
    server.logFormatter({
      method: () => ({}),
      url: () => ({}),
      status: () => ({})
    })
  }).toThrowError(/token.res is not a function/)
})

test('call logFormatter without token.response-time', () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  expect(() => {
    server.logFormatter({
      method: () => ({}),
      url: () => ({}),
      status: () => ({}),
      res: () => ({})
    })
  }).toThrowError(/token.response-time is not a function/)
})

test('call logFormatter', () => {
  expect.assertions(6)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  const result = {
    type: 'request',
    method: 'POST',
    url: 'http://xxx.xx',
    status: 'ok',
    contentLength: '100',
    responseTime: '-- ms'
  }
  const tokensMethodFn = jest.fn()
  const tokensUrlFn = jest.fn()
  const tokensStatusFm = jest.fn()
  const tokensResFm = jest.fn()
  const tokensResponseTimeFm = jest.fn()
  const tokens = {
    method: () => {
      tokensMethodFn()
      return result.method
    },
    url: () => {
      tokensUrlFn()
      return result.url
    },
    status: () => {
      tokensStatusFm()
      return result.status
    },
    res: () => {
      tokensResFm()
      return result.contentLength
    },
    'response-time': () => {
      tokensResponseTimeFm()
      return undefined
    }
  }
  expect(server.logFormatter(tokens)).toEqual(JSON.stringify(result))
  expect(tokensMethodFn).toBeCalled()
  expect(tokensUrlFn).toBeCalled()
  expect(tokensStatusFm).toBeCalled()
  expect(tokensResFm).toBeCalled()
  expect(tokensResponseTimeFm).toBeCalled()
})

test('call errorHandler without arguments', async () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  await expect(server.errorHandler()).rejects.toMatchObject({
    message: 'router param required'
  })
})

test('call errorHandler', async () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({
    environment: 'stage'
  })
  const router = {
    use: jest.fn()
  }
  await expect(server.errorHandler(router)).resolves.toBeUndefined()
})

test('call errorHandler with re.xhr', async () => {
  expect.assertions(13)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  const sendFn = jest.fn()
  const statusFn = jest.fn(() => {
    return { send: sendFn }
  })
  const nextFn = jest.fn()
  const renderFn = jest.fn()
  const status2Fn = jest.fn()
  const render2Fn = jest.fn()
  const status3Fn = jest.fn()
  const render3Fn = jest.fn()
  const router = {
    use: jest
      .fn()
      .mockImplementationOnce(cb => {
        cb('fail', { xhr: true }, { status: statusFn })
        cb('fail', { xhr: false }, { status: statusFn }, nextFn)
      })
      .mockImplementationOnce(cb => {
        cb({ url: 'http://' }, null, nextFn)
      })
      .mockImplementationOnce(cb => {
        cb({ message: 'fail' }, null, { status: statusFn, render: renderFn })
      })
      .mockImplementationOnce(cb => {
        cb({ status: 404 }, null, { status: status2Fn, render: render2Fn })
        cb({ status: 500 }, null, { status: status3Fn, render: render3Fn })
      })
  }
  await expect(server.errorHandler(router)).resolves.toBeUndefined()
  expect(statusFn).toHaveBeenCalledTimes(2)
  expect(statusFn).toHaveBeenNthCalledWith(1, 500)
  expect(statusFn).toHaveBeenNthCalledWith(2, 500)
  expect(sendFn).toBeCalledWith({ error: 'fail' })
  expect(nextFn).toHaveBeenCalledTimes(2)
  expect(nextFn).toHaveBeenNthCalledWith(1, 'fail')
  expect(nextFn).toHaveBeenNthCalledWith(2, new Error('Not Found : http://'))
  expect(renderFn).toBeCalledWith('error', {
    message: 'fail',
    error: expect.anything(),
    title: 'Error'
  })
  expect(status2Fn).toBeCalledWith(404)
  expect(render2Fn).toBeCalledWith('404')
  expect(status3Fn).toBeCalledWith(500)
  expect(render3Fn).toBeCalledWith('500')
})

test('call initialLocals without arguments', async () => {
  expect.assertions(1)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  await expect(server.initialLocals()).resolves.toBeUndefined()
})

test('call initialLocals without res', async () => {
  expect.assertions(2)
  const unit = requireTest()
  const server = new unit.ExpressServer({})
  const nextFn = jest.fn()
  await expect(
    server.initialLocals(null, null, nextFn)
  ).resolves.toBeUndefined()
  expect(nextFn).toBeCalled()
})

test('call initialLocals without req', async () => {
  expect.assertions(3)
  const unit = requireTest()
  const server = new unit.ExpressServer({
    environment: 'stage'
  })
  const nextFn = jest.fn()
  let res = { }
  await expect(server.initialLocals(null, res, nextFn)).resolves.toBeUndefined()
  expect(nextFn).toBeCalled()
  expect(res['locals']['env']).toEqual('stage')
})

test('call initialLocals', async () => {
  expect.assertions(3)
  const unit = requireTest()
  const server = new unit.ExpressServer({
    environment: 'stage'
  })
  const nextFn = jest.fn()
  let req = { protocol: 'http', headers: { host: 'localhost' }, url: '/home' }
  let res = { locals: {} }
  await expect(server.initialLocals(req, res, nextFn)).resolves.toBeUndefined()
  expect(nextFn).toBeCalled()
  expect(res.locals['url']).toEqual('http://localhost/home')
})
