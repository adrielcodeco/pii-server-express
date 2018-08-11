/**
 * Copyright 2018-present, CODECO. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ServerOptions } from '@pii/application'

export interface ExpressServerOptions extends ServerOptions {
  viewDir: string
  viewEngine: string
  publicDirs: string | string[]
  cookie_secret: string
  useFakeRedis: boolean
  redis?: any
  redis_prefix?: string
  session_name: string
  session_secret: string
}
