"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummySqlServerPersistence = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const IdentifiableSqlServerPersistence_1 = require("../../src/persistence/IdentifiableSqlServerPersistence");
class DummySqlServerPersistence extends IdentifiableSqlServerPersistence_1.IdentifiableSqlServerPersistence {
    constructor() {
        super('dummies');
    }
    defineSchema() {
        this.clearSchema();
        this.ensureSchema('CREATE TABLE [' + this._tableName + '] ([id] VARCHAR(32) PRIMARY KEY, [key] VARCHAR(50), [content] VARCHAR(MAX))');
        this.ensureIndex(this._tableName + '_key', { key: 1 }, { unique: true });
    }
    getPageByFilter(correlationId, filter, paging) {
        filter = filter || new pip_services3_commons_nodex_1.FilterParams();
        let key = filter.getAsNullableString('key');
        let filterCondition = null;
        if (key != null) {
            filterCondition += "[key]='" + key + "'";
        }
        return super.getPageByFilter(correlationId, filterCondition, paging, null, null);
    }
    getCountByFilter(correlationId, filter) {
        filter = filter || new pip_services3_commons_nodex_1.FilterParams();
        let key = filter.getAsNullableString('key');
        let filterCondition = null;
        if (key != null) {
            filterCondition += "[key]='" + key + "'";
        }
        return super.getCountByFilter(correlationId, filterCondition);
    }
}
exports.DummySqlServerPersistence = DummySqlServerPersistence;
//# sourceMappingURL=DummySqlServerPersistence.js.map