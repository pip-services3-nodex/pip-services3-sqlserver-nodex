"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyJsonSqlServerPersistence = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const IdentifiableJsonSqlServerPersistence_1 = require("../../src/persistence/IdentifiableJsonSqlServerPersistence");
class DummyJsonSqlServerPersistence extends IdentifiableJsonSqlServerPersistence_1.IdentifiableJsonSqlServerPersistence {
    constructor() {
        super('dummies_json');
    }
    defineSchema() {
        this.clearSchema();
        this.ensureTable();
        this.ensureSchema("ALTER TABLE [" + this._tableName + "] ADD [data_key] AS JSON_VALUE([data],'$.key')");
        this.ensureIndex(this._tableName + '_key', { data_key: 1 }, { unique: true });
    }
    getPageByFilter(correlationId, filter, paging) {
        filter = filter || new pip_services3_commons_nodex_1.FilterParams();
        let key = filter.getAsNullableString('key');
        let filterCondition = null;
        if (key != null) {
            filterCondition += "JSON_VALUE([data],'$.key')='" + key + "'";
        }
        return super.getPageByFilter(correlationId, filterCondition, paging, null, null);
    }
    getCountByFilter(correlationId, filter) {
        filter = filter || new pip_services3_commons_nodex_1.FilterParams();
        let key = filter.getAsNullableString('key');
        let filterCondition = null;
        if (key != null) {
            filterCondition += "JSON_VALUE([data],'$.key')='" + key + "'";
        }
        return super.getCountByFilter(correlationId, filterCondition);
    }
}
exports.DummyJsonSqlServerPersistence = DummyJsonSqlServerPersistence;
//# sourceMappingURL=DummyJsonSqlServerPersistence.js.map