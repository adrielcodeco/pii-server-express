import * as express from 'express';
import { Router } from '@pii/application';
export declare abstract class ExpressRouter extends Router {
    abstract init(server: express.Express): Promise<void>;
}
export declare const ExpressRouterToken: string;
//# sourceMappingURL=expressRouter.d.ts.map