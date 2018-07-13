/// <reference types="node" />
import * as http from 'http';
import express from 'express';
import { Server, ILogger } from '@pii/application';
import { ExpressServerOptions } from './expressServerOptions';
export declare class ExpressServer extends Server<http.Server, ExpressServerOptions> {
    express: express.Express;
    protected log: ILogger;
    constructor(options?: ExpressServerOptions);
    getLogTransports(): void;
    prepare(): Promise<void>;
    init(): Promise<void>;
    loadRoutes(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    protected logFormatter(tokens: any, req: express.Request, res: express.Response): string;
    errorHandler(router: express.Router): Promise<void>;
    initialLocals(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void>;
    authentication(): Promise<void>;
}
//# sourceMappingURL=expressServer.d.ts.map