/** @module build */
import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';

import { SqlServerConnection } from '../connect/SqlServerConnection';

/**
 * Creates SqlServer components by their descriptors.
 * 
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/build.factory.html Factory]]
 * @see [[SqlServerConnection]]
 */
export class DefaultSqlServerFactory extends Factory {
    private static readonly SqlServerConnectionDescriptor: Descriptor = new Descriptor("pip-services", "connection", "sqlserver", "*", "1.0");

    /**
	 * Create a new instance of the factory.
	 */
    public constructor() {
        super();
        this.registerAsType(DefaultSqlServerFactory.SqlServerConnectionDescriptor, SqlServerConnection);
    }
}
