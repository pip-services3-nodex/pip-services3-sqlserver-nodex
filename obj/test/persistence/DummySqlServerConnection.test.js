"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const process = require('process');
const assert = require('chai').assert;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const SqlServerConnection_1 = require("../../src/connect/SqlServerConnection");
const DummyPersistenceFixture_1 = require("../fixtures/DummyPersistenceFixture");
const DummySqlServerPersistence_1 = require("./DummySqlServerPersistence");
suite('DummySqlServerConnection', () => {
    let connection;
    let persistence;
    let fixture;
    let sqlserverUri = process.env['SQLSERVER_URI'];
    let sqlserverHost = process.env['SQLSERVER_HOST'] || 'localhost';
    let sqlserverPort = process.env['SQLSERVER_PORT'] || 1433;
    let sqlserverDatabase = process.env['SQLSERVER_DB'] || 'master';
    let sqlserverUser = process.env['SQLSERVER_USER'] || 'sa';
    let sqlserverPassword = process.env['SQLSERVER_PASSWORD'] || 'sqlserver_123';
    if (sqlserverUri == null && sqlserverHost == null) {
        return;
    }
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        let dbConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples('connection.uri', sqlserverUri, 'connection.host', sqlserverHost, 'connection.port', sqlserverPort, 'connection.database', sqlserverDatabase, 'credential.username', sqlserverUser, 'credential.password', sqlserverPassword);
        connection = new SqlServerConnection_1.SqlServerConnection();
        connection.configure(dbConfig);
        persistence = new DummySqlServerPersistence_1.DummySqlServerPersistence();
        persistence.setReferences(pip_services3_commons_nodex_3.References.fromTuples(new pip_services3_commons_nodex_2.Descriptor("pip-services", "connection", "sqlserver", "default", "1.0"), connection));
        fixture = new DummyPersistenceFixture_1.DummyPersistenceFixture(persistence);
        yield connection.open(null);
        yield persistence.open(null);
        yield persistence.clear(null);
    }));
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.close(null);
        yield persistence.close(null);
    }));
    test('Connection', () => {
        assert.isObject(connection.getConnection());
        assert.isString(connection.getDatabaseName());
    });
    test('Crud Operations', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testCrudOperations();
    }));
    test('Batch Operations', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testBatchOperations();
    }));
});
//# sourceMappingURL=DummySqlServerConnection.test.js.map