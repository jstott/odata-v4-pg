import { mocked } from 'ts-jest/utils'

import {createFilter} from './index';

describe('createFilter', () => {
    it('greaterthan string', () => {
      let filter = "completedDate ge '2019-09-01'";
      let sql = createFilter(filter); // map $filter OData to pgSql statement
      expect(sql.where).toEqual('"completed_date" >= ?');
      expect(sql.parameters[0]).toEqual('2019-09-01');
    });
    it('lessthan string', () => {
      let filter = "completedDate le '2019-09-01'";
      let sql = createFilter(filter); // map $filter OData to pgSql statement
      expect(sql.where).toEqual('"completed_date" <= ?');
      expect(sql.parameters[0]).toEqual('2019-09-01');
    });
    it('isnull', () => {
      let filter = "completedDate eq null";
      let sql = createFilter(filter); // map $filter OData to pgSql statement
      expect(sql.where).toEqual('"completed_date" IS NULL');
      expect(sql.parameters[0]).toBeNull();
    });
    it('isnotnull', () => {
      let filter = "completedDate ne null";
      let sql = createFilter(filter); // map $filter OData to pgSql statement
      expect(sql.where).toEqual('"completed_date" IS NOT NULL');
      expect(sql.parameters[0]).toBeNull();
    });
    it('isnot string', () => {
      let filter = "completedDate ne 'fred'";
      let sql = createFilter(filter); // map $filter OData to pgSql statement
      expect(sql.where).toEqual('"completed_date" <> ?');
      expect(sql.parameters[0]).toEqual('fred');
    });
    it('is equal or', () => {
      let filter = "completedDate eq 'fred' or completedDate eq 'sam'";
      let sql = createFilter(filter); // map $filter OData to pgSql statement
      expect(sql.where).toEqual('"completed_date" = ? OR "completed_date" = ?');
      expect(sql.parameters).toHaveLength(2);
      expect(sql.parameters[0]).toEqual('fred');
      expect(sql.parameters[1]).toEqual('sam');
    });
  })