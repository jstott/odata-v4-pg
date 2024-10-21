import { mocked } from 'ts-jest/utils'

import { createFilter } from './index';
import { raw } from 'objection';

describe('isNullOrEmpty', () => {



    it('camelCaseIsNull', () => {
        let filter = `isAssigned is null`;
        let sql = createFilter(filter); // map $filter OData to pgSql statement
        //console.log(sql.where);
        expect(sql.where).toEqual(`\"is_assigned\" IS NULL`);
    });

    it('isnull', () => {
        let filter = `category is null`;
        let sql = createFilter(filter); // map $filter OData to pgSql statement
        //console.log(sql.where);
        expect(sql.where).toEqual(`"category" IS NULL`);
    });

    it('isNull', () => {
        let filter = `categoryName is null`;
        let sql = createFilter(filter); // map $filter OData to pgSql statement
        //console.log(sql.where);
        expect(sql.where).toEqual(`"category_name" IS NULL`);
    });

    it('isNullOrEmpty-isAssigned column', () => {
        let filter = `isAssigned is nullOrEmpty`;
        let sql = createFilter(filter); // map $filter OData to pgSql statement
        //console.log(sql.where);
        expect(sql.where).toEqual(`( "is_assigned" IS NULL OR "is_assigned" = '' )`);
    });

    it('isNullOrEmpty-categoryName column', () => {
        let filter = `categoryName is nullOrEmpty`;
        let sql = createFilter(filter); // map $filter OData to pgSql statement
       // console.log(sql.where);
        expect(sql.where).toEqual(`( "category_name" IS NULL OR "category_name" = '' )`);
    });

    it("isNull expression", () => {
        let filter = `(isAssigned is null or isAssigned eq false)`;
        let sql = createFilter(filter); // map $filter OData to pgSql statement
        //console.log(sql.where);
        expect(sql.where).toEqual(`("is_assigned" IS NULL OR "is_assigned" = :0)`);
    });
});