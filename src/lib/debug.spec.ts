
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

  
})