function express () {
  return {
    set: () => {
      // does nothing
    },
    use: () => {
      // does nothing
    },
    disable: () => {
      // does nothing
    }
  }
}

// @ts-ignore
express.static = jest.fn()
// @ts-ignore
module.exports = express

export class Express {}
export interface Request {}
export interface Response {}
export interface NextFunction {}
export interface Router {}
