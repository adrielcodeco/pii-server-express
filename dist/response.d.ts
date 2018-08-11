import express from 'express';
export interface Response extends express.Response {
    redirectTo: (controller: {
        new (...args: any[]): any;
    }) => void;
}
//# sourceMappingURL=response.d.ts.map