/** @module persistence */
import { AnyValueMap } from 'pip-services3-commons-nodex';
import { IIdentifiable } from 'pip-services3-commons-nodex';

import { IdentifiableSqlServerPersistence } from './IdentifiableSqlServerPersistence';

/**
 * Abstract persistence component that stores data in SQLServer in JSON or JSONB fields
 * and implements a number of CRUD operations over data items with unique ids.
 * The data items must implement [[https://pip-services3-nodex.github.io/pip-services3-commons-nodex/interfaces/data.iidentifiable.html IIdentifiable]] interface.
 * 
 * The JSON table has only two fields: id and data.
 * 
 * In basic scenarios child classes shall only override [[getPageByFilter]],
 * [[getListByFilter]] or [[deleteByFilter]] operations with specific filter function.
 * All other operations can be used out of the box. 
 * 
 * In complex scenarios child classes can implement additional operations by 
 * accessing <code>this._collection</code> and <code>this._model</code> properties.

 * ### Configuration parameters ###
 * 
 * - table:                       (optional) SQLServer table name
 * - schema:                       (optional) SQLServer table name
 * - connection(s):    
 *   - discovery_key:             (optional) a key to retrieve the connection from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]]
 *   - host:                      host name or IP address
 *   - port:                      port number (default: 27017)
 *   - uri:                       resource URI or connection string with all parameters in it
 * - credential(s):    
 *   - store_key:                 (optional) a key to retrieve the credentials from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/auth.icredentialstore.html ICredentialStore]]
 *   - username:                  (optional) user name
 *   - password:                  (optional) user password
 * - options:
 *   - connect_timeout:      (optional) number of milliseconds to wait before timing out when connecting a new client (default: 0)
 *   - idle_timeout:         (optional) number of milliseconds a client must sit idle in the pool and not be checked out (default: 10000)
 *   - max_pool_size:        (optional) maximum number of clients the pool should contain (default: 10)
 * 
 * ### References ###
 * 
 * - <code>\*:logger:\*:\*:1.0</code>           (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages components to pass log messages
 * - <code>\*:discovery:\*:\*:1.0</code>        (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] services
 * - <code>\*:credential-store:\*:\*:1.0</code> (optional) Credential stores to resolve credentials
 * 
 * ### Example ###
 * 
 *     class MySqlServerPersistence extends IdentifiableSqlServerJsonPersistence<MyData, string> {
 *    
 *     public constructor() {
 *         base("mydata");
 *     }
 * 
 *     private composeFilter(filter: FilterParams): any {
 *         filter = filter || new FilterParams();
 *         let criteria = [];
 *         let name = filter.getAsNullableString('name');
 *         if (name != null)
 *             criteria.push({ name: name });
 *         return criteria.length > 0 ? { $and: criteria } : null;
 *     }
 * 
 *     public getPageByFilter(correlationId: string, filter: FilterParams,
 *         paging: PagingParams): Promise<DataPage<MyData>> {
 *         return base.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null);
 *     }
 * 
 *     }
 * 
 *     let persistence = new MySqlServerPersistence();
 *     persistence.configure(ConfigParams.fromTuples(
 *         "host", "localhost",
 *         "port", 27017
 *     ));
 * 
 *     await persitence.open("123");
 * 
 *     let item = await persistence.create("123", { id: "1", name: "ABC" });
 *     let page = await persistence.getPageByFilter(
 *         "123",
 *         FilterParams.fromTuples("name", "ABC"),
 *         null
 *      );
 *      console.log(page.data);          // Result: { id: "1", name: "ABC" }
 * 
 *      await persistence.deleteById("123", "1");
 */
export class IdentifiableJsonSqlServerPersistence<T extends IIdentifiable<K>, K> extends IdentifiableSqlServerPersistence<T, K> {
    /**
     * Creates a new instance of the persistence component.
     * 
     * @param tableName    (optional) a table name.
     * @param schemaName    (optional) a schema name.
     */
    public constructor(tableName: string, schemaName?: string) {
        super(tableName, schemaName);
    }

    /**
     * Adds DML statement to automatically create JSON(B) table
     * 
     * @param idType type of the id column (default: TEXT)
     * @param dataType type of the data column (default: JSONB)
     */
    protected ensureTable(idType: string = 'VARCHAR(32)', dataType: string = 'NVARCHAR(MAX)') {
        if (this._schemaName != null) {
            let query = "IF NOT EXISTS (SELECT * FROM [sys].[schemas] WHERE [name]=N'"
                + this._schemaName + "') EXEC('CREATE SCHEMA "
                + this.quoteIdentifier(this._schemaName) + "')";
            this.ensureSchema(query);
        }

        let query = "CREATE TABLE " + this.quotedTableName()
            + " ([id] " + idType + " PRIMARY KEY, [data] " + dataType + ")";
        this.ensureSchema(query);
    }

    /** 
     * Converts object value from internal to public format.
     * 
     * @param value     an object in internal format to convert.
     * @returns converted object in public format.
     */
    protected convertToPublic(value: any): any {
        if (value == null) return null;
        return JSON.parse(value.data);
    }    

    /** 
     * Convert object value from public to internal format.
     * 
     * @param value     an object in public format to convert.
     * @returns converted object in internal format.
     */
    protected convertFromPublic(value: any): any {
        if (value == null) return null;
        let result: any = {
            id: value.id,
            data: JSON.stringify(value)
        };
        return result;
    }    

    /** 
     * Converts the given object from the public partial format.
     * 
     * @param value     the object to convert from the public partial format.
     * @returns the initial object.
     */
    protected convertFromPublicPartial(value: any): any {
        return value;
    }    

    /**
     * Updates only few selected fields in a data item.
     * 
     * @param correlation_id    (optional) transaction id to trace execution through call chain.
     * @param id                an id of data item to be updated.
     * @param data              a map with fields to be updated.
     * @returns the updated item.
     */
    public async updatePartially(correlationId: string, id: K, data: AnyValueMap): Promise<T> {            
        if (data == null || id == null) {
            return null;
        }

        let row = this.convertFromPublicPartial(data.getAsObject());
        let columns = Object.keys(row);
        let values = Object.values(row);

        let set = "[data]";
        for (let index = 1; index <= columns.length; index++) {
            let column = columns[index - 1];
            set = "JSON_MODIFY(" + set + ",'$." + column + "',@" + index + ")";
        }

        values.push(id);

        let query = "UPDATE " + this.quotedTableName() + " SET [data]=" + set + " OUTPUT INSERTED.* WHERE [id]=@" + values.length;

        let request = this.createRequest(values);
        let newItem = await new Promise<any>((resolve, reject) => {
            request.query(query, (err, result) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                let item = result && result.recordset && result.recordset.length == 1
                    ? result.recordset[0] : null;
                resolve(item);
            });
        });

        this._logger.trace(correlationId, "Updated partially in %s with id = %s", this._tableName, id);

        newItem = this.convertToPublic(newItem);
        return newItem;
    }

}
