import { mocked } from 'ts-jest/utils'

import { createFilter } from './index';

describe('createFilter', () => {
  /**
   * minor extension to return parameters as an object, for knex.js named parameters
   * http://knexjs.org/#Builder-whereRaw
   */
  it('parameterObject', () => {
    let filter = "name eq 'fred' or name eq 'sam'";
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    expect(sql.where).toEqual('"name" = :0 OR "name" = :1');
    expect(sql.parameters).toHaveLength(2);
    expect(sql.parameterObject()).toEqual({ 0: 'fred', 1: 'sam' });
  });
  it('date between string', () => {
    let filter = "(completedDate gt '2019-09-01' and completedDate lt '2019-10-01')";
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    expect(sql.where).toEqual('("completed_date" > :0 AND "completed_date" < :1)');
    expect(sql.parameters).toHaveLength(2);
    expect(sql.parameters[0]).toEqual('2019-09-01');
  });
  it('greater than dates string', () => {
    let filter = "completedDate gt '2019-09-01'";
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    expect(sql.where).toEqual('"completed_date" > :0');
    expect(sql.parameters[0]).toEqual('2019-09-01');
  });
  it('greaterthanequal string', () => {
    let filter = "completedDate ge '2019-09-01'";
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    expect(sql.where).toEqual('"completed_date" >= :0');
    expect(sql.parameters[0]).toEqual('2019-09-01');
  });
  it('lessthan string', () => {
    let filter = "completedDate le '2019-09-01'";
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    expect(sql.where).toEqual('"completed_date" <= :0');
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
    expect(sql.where).toEqual('"completed_date" <> :0');
    expect(sql.parameters[0]).toEqual('fred');
  });
  it('is equal or', () => {
    let filter = "completedDate eq 'fred' or completedDate eq 'sam'";
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    expect(sql.where).toEqual('"completed_date" = :0 OR "completed_date" = :1');
    expect(sql.parameters).toHaveLength(2);
    expect(sql.parameters[0]).toEqual('fred');
    expect(sql.parameters[1]).toEqual('sam');
  });
  it('startswith', () => {
    let filter = "startswith(status,'Cus')";
    let sql = createFilter(filter);
    expect(sql.where).toEqual('"status" LIKE :0')
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameters[0]).toEqual('Cus%');
  })
  it('contains', () => {
    let filter = "contains(status,'Cus')";
    let sql = createFilter(filter);
    expect(sql.where).toEqual('"status" LIKE :0')
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameters[0]).toEqual('%Cus%');
  })
})