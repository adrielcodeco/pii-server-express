# [Pii Express Server](https://github.com/adrielcodeco/pii-server-express)

Express server implementation for Pii Application

## Documentation


* [Quick Start](https://github.com/adrielcodeco/pii-server-express/quick-start.html)
* [Examples](https://github.com/adrielcodeco/pii-server-express/examples.html)

## Examples

Here is a simple example to get you started:

index.ts

```ts
...
import { ExpressServer } from '@pii/server-express'
...

...
const server = new ExpressServer()
Container.addSingleton(server)
...
```

### License

This project is [MIT licensed](./LICENSE).