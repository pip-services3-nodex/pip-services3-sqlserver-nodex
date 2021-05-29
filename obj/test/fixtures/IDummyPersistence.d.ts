import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { AnyValueMap } from 'pip-services3-commons-nodex';
import { Dummy } from './Dummy';
export interface IDummyPersistence {
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<Dummy>>;
    getCountByFilter(correlationId: string, filter: FilterParams): Promise<number>;
    getListByIds(correlationId: string, ids: string[]): Promise<Dummy[]>;
    getOneById(correlationId: string, id: string): Promise<Dummy>;
    create(correlationId: string, item: Dummy): Promise<Dummy>;
    update(correlationId: string, item: Dummy): Promise<Dummy>;
    set(correlationId: string, item: Dummy): Promise<Dummy>;
    updatePartially(correlationId: string, id: string, data: AnyValueMap): Promise<Dummy>;
    deleteById(correlationId: string, id: string): Promise<Dummy>;
    deleteByIds(correlationId: string, id: string[]): Promise<void>;
}
