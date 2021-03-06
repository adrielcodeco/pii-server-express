import { ServerOptions } from '@pii/application';
export interface ExpressServerOptions extends ServerOptions {
    viewDir: string;
    viewEngine: string;
    publicDirs: string | string[];
    cookie_secret: string;
    useFakeRedis: boolean;
    redis?: any;
    redis_prefix?: string;
    session_name: string;
    session_secret: string;
}
//# sourceMappingURL=expressServerOptions.d.ts.map