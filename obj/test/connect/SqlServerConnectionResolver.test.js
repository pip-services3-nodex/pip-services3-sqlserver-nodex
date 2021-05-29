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
const assert = require('chai').assert;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const SqlServerConnectionResolver_1 = require("../../src/connect/SqlServerConnectionResolver");
suite('SqlServerConnectionResolver', () => {
    test('Connection Config', () => __awaiter(void 0, void 0, void 0, function* () {
        let dbConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples('connection.host', 'localhost', 'connection.port', 1433, 'connection.database', 'test', 'connection.encrypt', true, 'credential.username', 'sa', 'credential.password', 'pwd#123');
        let resolver = new SqlServerConnectionResolver_1.SqlServerConnectionResolver();
        resolver.configure(dbConfig);
        let uri = yield resolver.resolve(null);
        assert.isString(uri);
        assert.equal('mssql://sa:pwd#123@localhost:1433/test?encrypt=true', uri);
    }));
});
//# sourceMappingURL=SqlServerConnectionResolver.test.js.map