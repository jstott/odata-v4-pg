"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg = require("pg");
const config = require("config");
const index_1 = require("../lib/index");
const odata_v4_server_1 = require("odata-v4-server");
let db = config.get("sqlConfig");
let pool = new pg.Pool(db);
let Country = class Country {
};
__decorate([
    odata_v4_server_1.Edm.Key,
    odata_v4_server_1.Edm.String
], Country.prototype, "code", void 0);
Country = __decorate([
    odata_v4_server_1.Edm.OpenType
], Country);
let City = class City {
};
__decorate([
    odata_v4_server_1.Edm.Key,
    odata_v4_server_1.Edm.Int32
], City.prototype, "id", void 0);
City = __decorate([
    odata_v4_server_1.Edm.OpenType
], City);
class CountryLanguage {
}
__decorate([
    odata_v4_server_1.Edm.String
], CountryLanguage.prototype, "countrycode", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], CountryLanguage.prototype, "language", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], CountryLanguage.prototype, "isofficial", void 0);
__decorate([
    odata_v4_server_1.Edm.Double
], CountryLanguage.prototype, "percentage", void 0);
let CountriesController = class CountriesController extends odata_v4_server_1.ODataController {
    async getCountries(query) {
        let sqlQuery = (0, index_1.createQuery)(query);
        return (await pool.connect()).query(sqlQuery.from("country"), sqlQuery.parameters).then(result => result.rows);
    }
    async getCountry(code, query) {
        let sqlQuery = (0, index_1.createQuery)(query);
        return (await pool.connect()).query(`SELECT ${sqlQuery.select} FROM country WHERE code = $${sqlQuery.parameters.length + 1} AND (${sqlQuery.where})`, sqlQuery.parameters.concat([code])).then(result => result.rows[0]);
    }
};
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.query)
], CountriesController.prototype, "getCountries", null);
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.key),
    __param(1, odata_v4_server_1.odata.query)
], CountriesController.prototype, "getCountry", null);
CountriesController = __decorate([
    odata_v4_server_1.odata.type(Country)
], CountriesController);
let CitiesController = class CitiesController extends odata_v4_server_1.ODataController {
    async getCities(stream, query) {
        let sqlQuery = (0, index_1.createQuery)(query);
        return (await pool.connect()).query(sqlQuery.from("country"), sqlQuery.parameters).then(result => result.rows);
    }
    async getCity(id, query) {
        let sqlQuery = (0, index_1.createQuery)(query);
        return (await pool.connect()).query(`SELECT ${sqlQuery.select} FROM country WHERE id = $${sqlQuery.parameters.length + 1} AND (${sqlQuery.where})`, sqlQuery.parameters.concat([id])).then(result => result.rows[0]);
    }
};
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.stream),
    __param(1, odata_v4_server_1.odata.query)
], CitiesController.prototype, "getCities", null);
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.key),
    __param(1, odata_v4_server_1.odata.query)
], CitiesController.prototype, "getCity", null);
CitiesController = __decorate([
    odata_v4_server_1.odata.type(City)
], CitiesController);
let CountryLanguagesController = class CountryLanguagesController extends odata_v4_server_1.ODataController {
    async getLanguages(stream, query) {
        let sqlQuery = (0, index_1.createQuery)(query);
        return (await pool.connect()).query(sqlQuery.from("countrylanguage"), sqlQuery.parameters).then(result => result.rows);
    }
};
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.stream),
    __param(1, odata_v4_server_1.odata.query)
], CountryLanguagesController.prototype, "getLanguages", null);
CountryLanguagesController = __decorate([
    odata_v4_server_1.odata.type(CountryLanguage)
], CountryLanguagesController);
let SqlServer = class SqlServer extends odata_v4_server_1.ODataServer {
};
SqlServer = __decorate([
    odata_v4_server_1.odata.cors,
    odata_v4_server_1.odata.controller(CountriesController, true),
    odata_v4_server_1.odata.controller(CitiesController, true),
    odata_v4_server_1.odata.controller(CountryLanguagesController, true)
], SqlServer);
SqlServer.create("/odata", 3004);
//# sourceMappingURL=sql.js.map