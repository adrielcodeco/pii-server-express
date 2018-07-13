/**
 * Copyright 2018-present, CODECO. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export {}

const requireTest = () => {
  return require('../src')
}

test('require', () => {
  expect.assertions(4)
  const unit = requireTest()
  expect(unit).toHaveProperty('ExpressRouter')
  expect(unit).toHaveProperty('ExpressRouterToken')
  expect(unit).toHaveProperty('ExpressServer')
  expect(Object.keys(unit).length).toEqual(3)
})
