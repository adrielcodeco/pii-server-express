/**
 * Copyright 2018-present, CODECO. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as express from 'express'
import { Router } from '@pii/application'
import { Token } from '@pii/di'

export abstract class ExpressRouter extends Router {
  abstract async init (server: express.Express): Promise<void>
}

export const ExpressRouterToken = Token(ExpressRouter)
