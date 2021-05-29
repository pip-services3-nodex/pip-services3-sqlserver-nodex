/** @module persistence */
import { AnyValueMap } from 'pip-services3-commons-nodex';
import { IIdentifiable } from 'pip-services3-commons-nodex';
import { IdGenerator } from 'pip-services3-commons-nodex';

import { IWriter } from 'pip-services3-data-nodex';
import { IGetter } from 'pip-services3-data-nodex';
import { ISetter } from 'pip-services3-data-nodex';

import { SqlServerPersistence } from './SqlServerPersistence';

/**
 * Abstract persistence component that stores data in SQLServer
 * and implements a number of CRUD operations over data items with unique ids.
 * The data items must implement [[https://pip-services3-nodex.github.io/pip-services3-commons-nodex/interfaces/data.iidentifiable.html IIdentifiable]] interface.
 * 
 * In basic scenarios child classes shall only override [[getPageByFilter]],
 * [[getListByFilter]] or [[deleteByFilter]] operations with specific filter function.
 * All other operations can be used out of the box. 
 * 
 * In complex scenarios child classes can implement additional operations by 
 * accessing <code>this._collection</code> and <code>this._model</code> properties.

 * ### Configuration parameters ###
 * 
 * - collection:                  (optional) SQLServer collection name
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
 *     class MySqlServerPersistence extends IdentifiableSqlServerPersistence<MyData, string> {
 *    
 *     public constructor() {
 *         base("mydata");
 *     }
 * 
 *     private composeFilter(filter: FilterParams): string {
 *         filter = filter || new FilterParams();
 *         let criteria = [];
 *         let name = filter.getAsNullableString('name');
 *         if (name != null)
 *             criteria.push("[name]='" + name + "'");
 *         return criteria.length > 0 ? criteria.join(" AND ") : null;
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
 *        "123",
 *        FilterParams.fromTuples("name", "ABC"),
 *        null
 *     );
 * 
 *     console.log(page.data);          // Result: { id: "1", name: "ABC" }
 * 
 *     await persistence.deleteById("123", "1");
 */
export class IdentifiableSqlServerPersistence<T extends IIdentifiable<K>, K> extends SqlServerPersistence<T>
    implements IWriter<T, K>, IGetter<T, K>, ISetter<T> {

    /**
     * Creates a new instance of the persistence component.
     * 
     * @param collection    (optional) a collection name.
     */
    public constructor(tableName: string) {
        super(tableName);

        if (tableName == null) {
            throw new Error("Table name could not be null");
        }
    }

    /** 
     * Converts the given object from the public partial format.
     * 
     * @param value     the object to convert from the public partial format.
     * @returns the initial object.
     */
    protected convertFromPublicPartial(value: any): any {
        return this.convertFromPublic(value);
    }    
    
    /**
     * Gets a list of data items retrieved by given unique ids.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param ids               ids of data items to be retrieved
     * @returns a list with requested data items.
     */
    public async getListByIds(correlationId: string, ids: K[]): Promise<T[]> {
        let params = this.generateParameters(ids);
        let query = "SELECT * FROM " + this.quoteIdentifier(this._tableName) + " WHERE [id] IN(" + params + ")";

        let request = this.createRequest(ids);
        let items = await new Promise<any[]>((resolve, reject) => {
            request.query(query, (err, result) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                let items = result.recordset;
                resolve(items);
            });
        });

        this._logger.trace(correlationId, "Retrieved %d from %s", items.length, this._tableName);
                
        items = items.map(this.convertToPublic);
        return items;
    }

    /**
     * Gets a data item by its unique id.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param id                an id of data item to be retrieved.
     * @returns the requested data item or <code>null</code> if nothing was found.
     */
    public async getOneById(correlationId: string, id: K): Promise<T> {
        let query = "SELECT * FROM " + this.quoteIdentifier(this._tableName) + " WHERE [id]=@1";
        let params = [ id ];

        let request = this.createRequest(params);
        let item = await new Promise<any>((resolve, reject) => {
            request.query(query, (err, result) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                let item = result && result.recordset ? result.recordset[0] || null : null; 
                resolve(item);
            });
        });

        if (item == null) {
            this._logger.trace(correlationId, "Nothing found from %s with id = %s", this._tableName, id);
        } else {
            this._logger.trace(correlationId, "Retrieved from %s with id = %s", this._tableName, id);
        }

        item = this.convertToPublic(item);
        return item;
    }

    /**
     * Creates a data item.
     * 
     * @param correlation_id    (optional) transaction id to trace execution through call chain.
     * @param item              an item to be created.
     * @returns a created item.
     */
    public create(correlationId: string, item: T): Promise<T> {
        if (item == null) {
            return null;
        }

        // Assign unique id
        let newItem: any = item;
        if (newItem.id == null) {
            newItem = Object.assign({}, newItem);
            newItem.id = item.id || IdGenerator.nextLong();
        }

        return super.create(correlationId, newItem);
    }

    /**
     * Sets a data item. If the data item exists it updates it,
     * otherwise it create a new data item.
     * 
     * @param correlation_id    (optional) transaction id to trace execution through call chain.
     * @param item              a item to be set.
     * @returns the updated item.
     */
    public async set(correlationId: string, item: T): Promise<T> {
        if (item == null) {
            return null;
        }

        // Assign unique id
        if (item.id == null) {
            item = Object.assign({}, item);
            item.id = <any>IdGenerator.nextLong();
        }

        let row = this.convertFromPublic(item);
        let columns = this.generateColumns(row);
        let params = this.generateParameters(row);
        let setParams = this.generateSetParameters(row);
        let values = this.generateValues(row);
        values.push(item.id);

        let query = "INSERT INTO " + this.quoteIdentifier(this._tableName) + " (" + columns + ") OUTPUT INSERTED.* VALUES (" + params + ")";

        let request = this.createRequest(values);
        let newItem = await new Promise<any>((resolve, reject) => {
            request.query(query, (err, result) => {
                // Suppress duplicated error entry
                if (err != null && (err.number == 2601 || err.number == 2627)) {
                    err = null;
                    result == null;
                }
                if (err != null) {
                    reject(err);
                    return;
                }                
                let item = result && result.recordset && result.recordset.length == 1
                    ? result.recordset[0] : null;
                resolve(item);
            });
        });

        if (newItem != null) {
            this._logger.trace(correlationId, "Set in %s with id = %s", this._tableName, item.id);

            newItem = this.convertToPublic(newItem);
            return newItem;
        }

        values.push(item.id);
        query = "UPDATE " + this.quoteIdentifier(this._tableName) + " SET " + setParams + " OUTPUT INSERTED.* WHERE [id]=@" + values.length;

        request = this.createRequest(values);
        newItem = await new Promise<any>((resolve, reject) => {
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

        this._logger.trace(correlationId, "Set in %s with id = %s", this._tableName, item.id);
        
        newItem = this.convertToPublic(newItem);
        return newItem;
    }


    /**
     * Updates a data item.
     * 
     * @param correlation_id    (optional) transaction id to trace execution through call chain.
     * @param item              an item to be updated.
     * @returns the updated item.
     */
    public async update(correlationId: string, item: T): Promise<T> {
        if (item == null || item.id == null) {
            return null;
        }

        let row = this.convertFromPublic(item);
        let params = this.generateSetParameters(row);
        let values = this.generateValues(row);
        values.push(item.id);

        let query = "UPDATE " + this.quoteIdentifier(this._tableName)
            + " SET " + params + " OUTPUT INSERTED.* WHERE [id]=@" + values.length;

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

        this._logger.trace(correlationId, "Updated in %s with id = %s", this._tableName, item.id);

        newItem = this.convertToPublic(newItem);
        return newItem;
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
        let params = this.generateSetParameters(row);
        let values = this.generateValues(row);
        values.push(id);

        let query = "UPDATE " + this.quoteIdentifier(this._tableName)
            + " SET " + params + " OUTPUT INSERTED.* WHERE [id]=@" + values.length;

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

    /**
     * Deleted a data item by it's unique id.
     * 
     * @param correlation_id    (optional) transaction id to trace execution through call chain.
     * @param id                an id of the item to be deleted
     * @returns the deleted item.
     */
    public async deleteById(correlationId: string, id: K): Promise<T> {
        let values = [ id ];

        let query = "DELETE FROM " + this.quoteIdentifier(this._tableName) + " OUTPUT DELETED.* WHERE [id]=@1";

        let request = this.createRequest(values);
        let oldItem = await new Promise<any>((resolve, reject) => {
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

        this._logger.trace(correlationId, "Deleted from %s with id = %s", this._tableName, id);

        oldItem = this.convertToPublic(oldItem);
        return oldItem;
    }

    /**
     * Deletes multiple data items by their unique ids.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param ids               ids of data items to be deleted.
     */
    public async deleteByIds(correlationId: string, ids: K[]): Promise<void> {
        let params = this.generateParameters(ids);
        let query = "DELETE FROM " + this.quoteIdentifier(this._tableName) + " WHERE \"id\" IN(" + params + ")";

        let request = this.createRequest(ids);
        let count = await new Promise<number>((resolve, reject) => {
            request.query(query, (err, result) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                let count = result && result.rowsAffected ? result.rowsAffected[0] : 0;
                resolve(count);
            });    
        });

        this._logger.trace(correlationId, "Deleted %d items from %s", count, this._tableName);
    }
}
