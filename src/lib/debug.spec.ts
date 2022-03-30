
import { mocked } from 'ts-jest/utils'

import { createFilter } from './index';
import { raw } from 'objection';

describe('createFilter', () => {
  /* 
       it('jsonb', () => {
          let filter = `(contains(bmsticket__status,'ari') )`;
          let sql = createFilter(filter); // map $filter OData to pgSql statement
         // console.log(sql.where);
          expect(sql.where).toEqual(`("bmsticket"."status" ~* :0)`);
          expect(sql.parameters).toHaveLength(1);
      
        });  */

  it('jsonb', () => {
    let filter = `( contains(bmsticket__status,'ari') or contains(shiptoAddress->>'name', 'ari') )`;
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    expect(sql.where).toEqual(`("bmsticket"."status" ~* :0 OR "shipto_address"->>'name' ~* :1)`);
    expect(sql.parameters).toHaveLength(2);
  });

  it('issueType', () => {
    let filter = `issueType eq 'Onboarding %2F Build'`;
    let sql = createFilter(filter); // map $filter OData to pgSql statement
  
    expect(sql.where).toEqual('"issue_type" = :0');
    expect(sql.parameters).toHaveLength(1);
    expect(sql.parameterObject()).toEqual({ 0: 'Onboarding / Build'});

  });

  it('cast', () => {
    let filter = `contains(cast('clients',Edm.String), 'Scup')`;
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    console.log(sql.where);
   // expect(sql.where).toEqual('"clients" = :0');

   

   
  });


})