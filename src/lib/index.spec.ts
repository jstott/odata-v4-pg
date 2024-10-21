import { mocked } from 'ts-jest/utils'

import { createFilter } from './index';
import { raw } from 'objection';

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
  it('testOdata', () => {
    let filter = "Category__jjj eq 1";
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    //console.log(sql.where);
    
    expect(sql.where).toEqual(`\"category\".\"jjj\" = :0`);
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
    expect(sql.where).toEqual('"status" ILIKE :0')
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameters[0]).toEqual('Cus%');
  })
  it('contains', () => {
    let filter = "contains(status,'Cus')";
    let sql = createFilter(filter);
    expect(sql.where).toEqual('"status" ~* :0')
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameters[0]).toEqual('Cus');
  });
  it('geography', () => {
    let filter = `geography`;
    let sql = createFilter(filter);
    //console.log(sql);
    //expect(sql.where).toEqual('"status" ~* :0')
    //expect(sql.parameters).toHaveLength(1);
    //expect(sql.parameters[0]).toEqual('Cus')
  });
  it('containsAny', () => {
    let filter = "containsAny(status,'Cus')";
    let sql = createFilter(filter);
    expect(sql.where).toEqual(`array_to_string("status", ' ') ~* :0`)
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameters[0]).toEqual('Cus');
  });
  /* it('in', () => {
    let filter = "fred in ('Milk', 'Cheese', 'Donut')";
    let sql = createFilter(filter);
    expect(sql.where).toEqual('"fred" in :0')
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameters[0]).toEqual('Milk');
  }); */

  it('substringof-simple', () => {
    let filter = "substringof('10.20.0.220', ip_address)";
    let sql = createFilter(filter);
    expect(sql.where).toEqual(`"ip_address" ILIKE :0`)
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameters[0]).toEqual('%10.20.0.220%');
    expect(sql.parameterObject()).toEqual({ '0': '%10.20.0.220%' });
    //console.log(sql.parameterObject());
  });
  it('substringof', () => {
    // for table.column names, fails parser, replace . with double underscore __,  and __ will be be replaced with '.',
    // and the table.column will be correctly double-quoted in where clause.
    let filter = "alarmCount ne null and ( substringof('220', name)  or substringof('120', bms_hardware_asset__ip_address) )";
    let sql = createFilter(filter);
    expect(sql.where).toEqual(`"alarm_count" IS NOT NULL AND ("name" ILIKE :1 OR "bms_hardware_asset\"."ip_address" ILIKE :2)`)
    expect(sql.parameters).toHaveLength(3);
    expect(sql.parameters[0]).toEqual(null);
    expect(sql.parameters[1]).toEqual('%220%');
    expect(sql.parameters[2]).toEqual('%120%');
    /*
    console.log(sql.parameterObject());
    const where = raw(sql.where,sql.parameterObject());
    console.log(sql.parameterObject());
    */
  });
  it('table-column', () => {
    let filter = "ticket__status eq 'Pending Customer'";
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    //console.log(sql.where);
    expect(sql.where).toEqual('"ticket"."status" = :0');
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameterObject()).toEqual({ 0: 'Pending Customer' });
  });
  
  it('table-column2', () => {
    let filter = "ticket/status eq 'Pending Customer'";
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    //console.log(sql.where);
    expect(sql.where).toEqual('"ticket""status" = :0');
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameterObject()).toEqual({ 0: 'Pending Customer' });
  });
  it('table-column_snake', () => {
    let filter = "bmsTicket__status eq 'Pending Customer'";
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    //console.log(sql.where);
    expect(sql.where).toEqual('"bms_ticket"."status" = :0');
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameterObject()).toEqual({ 0: 'Pending Customer' });
  });

  it('table-column_snake2', () => {
    let filter = "bmsticketorder__shipto_address__name eq 'Daniel McDonald'";
    let sql = createFilter(filter); // map $filter OData to pgSql statement
   // console.log(sql.where);
    expect(sql.where).toEqual('"bmsticketorder"."shipto_address"."name" = :0');
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameterObject()).toEqual({ 0: 'Daniel McDonald' });
  });

  
  it('jsonb', () => {
    let filter = `shipto->>'fred' eq 'csonl'`;
    let sql = createFilter(filter); // map $filter OData to pgSql statement
   // console.log(sql.where);
    expect(sql.where).toEqual(`"shipto"->>'fred' = :0`);
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameterObject()).toEqual({ 0: 'csonl' });
  });

  it('jsonb full path', () => {
    let filter = `meta->'order'->'shipTo'->>'name' eq 'Kari Driver'`;
    let sql = createFilter(filter); // map $filter OData to pgSql statement
   // console.log(sql.where);
    expect(sql.where).toEqual(`"meta"->'order'->'shipTo'->>'name' = :0`);
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameterObject()).toEqual({ 0: 'Kari Driver' });
  });

  it('jsonb contains', () => {
    let filter = `contains(shipto->>'fred', 'csonl')`;
    let sql = createFilter(filter); // map $filter OData to pgSql statement
   // console.log(sql.where);
   expect(sql.where).toEqual(`"shipto"->>'fred' ~* :0`)
   expect(sql.parameters).toHaveLength(1);
   expect(sql.parameters[0]).toEqual('csonl');
  });

  it('jsonb contains complex path', () => {
    let filter = `shiptoAddress->'order'->'shipTo'->>'name' eq 'Kari Driver'`;
    let sql = createFilter(filter); // map $filter OData to pgSql statement
   // console.log(sql.where);
   expect(sql.where).toEqual(`"shipto_address"->'order'->'shipTo'->>'name' = :0`)
   expect(sql.parameters).toHaveLength(1);
   expect(sql.parameters[0]).toEqual('Kari Driver');
  });

  it('jsonb contains mixed use OR statement', () => {
  let filter = `( contains(bmsticket__status,'ari') or contains(shiptoAddress->>'name', 'ari') )`;
     let sql = createFilter(filter); // map $filter OData to pgSql statement
     expect(sql.where).toEqual(`("bmsticket"."status" ~* :0 OR "shipto_address"->>'name' ~* :1)`);
     expect(sql.parameters).toHaveLength(2);
    });
  // 
})