/**
 * Copyright 2018-present, CODECO. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {}

const requireTest = () => {
  jest.resetModules()
  return require('../src/expressRouter')
}

test('require', () => {
  expect.assertions(3)
  const unit = requireTest()
  expect(unit).toHaveProperty('ExpressRouter')
  expect(unit).toHaveProperty('ExpressRouterToken')
  expect(Object.keys(unit).length).toEqual(2)
})

test('new', () => {
  expect.assertions(1)
  const unit = requireTest()
  expect(() => {
    // tslint:disable:nextline no-unused-expression
    new unit.ExpressRouter()
  }).not.toThrow()
})
