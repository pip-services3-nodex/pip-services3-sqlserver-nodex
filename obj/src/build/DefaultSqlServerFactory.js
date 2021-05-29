"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultSqlServerFactory = void 0;
/** @module build */
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const SqlServerConnection_1 = require("../connect/SqlServerConnection");
/**
 * Creates SqlServer components by their descriptors.
 *
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/build.factory.html Factory]]
 * @see [[SqlServerConnection]]
 */
class DefaultSqlServerFactory extends pip_services3_components_nodex_1.Factory {
    /**
     * Create a new instance of the factory.
     */
    constructor() {
        super();
        this.registerAsType(DefaultSqlServerFactory.SqlServerConnectionDescriptor, SqlServerConnection_1.SqlServerConnection);
    }
}
exports.DefaultSqlServerFactory = DefaultSqlServerFactory;
DefaultSqlServerFactory.SqlServerConnectionDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "connection", "sqlserver", "*", "1.0");
//# sourceMappingURL=DefaultSqlServerFactory.js.map