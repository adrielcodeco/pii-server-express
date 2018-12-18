"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var application_1 = require("@pii/application");
var di_1 = require("@pii/di");
var ExpressRouter = (function (_super) {
    __extends(ExpressRouter, _super);
    function ExpressRouter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ExpressRouter;
}(application_1.Router));
exports.ExpressRouter = ExpressRouter;
exports.ExpressRouterToken = di_1.Token(ExpressRouter);

//# sourceMappingURL=expressRouter.js.map
