const process = require('process');
const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';
import { SqlServerConnection } from '../../src/connect/SqlServerConnection';
import { DummyPersistenceFixture } from '../fixtures/DummyPersistenceFixture';
import { DummySqlServerPersistence } from './DummySqlServerPersistence';

suite('DummySqlServerConnection', ()=> {
    let connection: SqlServerConnection;
    let persistence: DummySqlServerPersistence;
    let fixture: DummyPersistenceFixture;

    let sqlserverUri = process.env['SQLSERVER_URI'];
    let sqlserverHost = process.env['SQLSERVER_HOST'] || 'localhost';
    let sqlserverPort = process.env['SQLSERVER_PORT'] || 1433;
    let sqlserverDatabase = process.env['SQLSERVER_DB'] || 'master';
    let sqlserverUser = process.env['SQLSERVER_USER'] || 'sa';
    let sqlserverPassword = process.env['SQLSERVER_PASSWORD'] || 'sqlserver_123';
    if (sqlserverUri == null && sqlserverHost == null) {
        return;
    }

    setup(async () => {
        let dbConfig = ConfigParams.fromTuples(
            'connection.uri', sqlserverUri,
            'connection.host', sqlserverHost,
            'connection.port', sqlserverPort,
            'connection.database', sqlserverDatabase,
            'credential.username', sqlserverUser,
            'credential.password', sqlserverPassword
        );

        connection = new SqlServerConnection();
        connection.configure(dbConfig);

        persistence = new DummySqlServerPersistence();
        persistence.setReferences(References.fromTuples(
            new Descriptor("pip-services", "connection", "sqlserver", "default", "1.0"), connection
        ));

        fixture = new DummyPersistenceFixture(persistence);

        await connection.open(null);
        await persistence.open(null);
        await persistence.clear(null);
    });

    teardown(async () => {
        await connection.close(null);
        await persistence.close(null);
    });

    test('Connection', () => {
        assert.isObject(connection.getConnection());
        assert.isString(connection.getDatabaseName());
    });

    test('Crud Operations', async () => {
        await fixture.testCrudOperations();
    });

    test('Batch Operations', async () => {
        await fixture.testBatchOperations();
    });
});