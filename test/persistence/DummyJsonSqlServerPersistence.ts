import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';

import { IdentifiableJsonSqlServerPersistence } from '../../src/persistence/IdentifiableJsonSqlServerPersistence';
import { Dummy } from '../fixtures/Dummy';
import { IDummyPersistence } from '../fixtures/IDummyPersistence';

export class DummyJsonSqlServerPersistence 
    extends IdentifiableJsonSqlServerPersistence<Dummy, string> 
    implements IDummyPersistence
{
    public constructor() {
        super('dummies_json');
    }

    protected defineSchema(): void {
        this.clearSchema();
        this.ensureTable();
        this.ensureSchema("ALTER TABLE [" + this._tableName + "] ADD [data_key] AS JSON_VALUE([data],'$.key')")
        this.ensureIndex(this._tableName + '_key', { data_key: 1 }, { unique: true });
    }

    public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<Dummy>> {
        filter = filter || new FilterParams();
        let key = filter.getAsNullableString('key');

        let filterCondition: string = null;
        if (key != null) {
            filterCondition += "JSON_VALUE([data],'$.key')='" + key + "'";
        }

        return super.getPageByFilter(correlationId, filterCondition, paging, null, null);
    }

    public getCountByFilter(correlationId: string, filter: FilterParams): Promise<number> {
        filter = filter || new FilterParams();
        let key = filter.getAsNullableString('key');

        let filterCondition: string = null;
        if (key != null) {
            filterCondition += "JSON_VALUE([data],'$.key')='" + key + "'";
        }

        return super.getCountByFilter(correlationId, filterCondition);
    }
}