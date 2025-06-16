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
  it('vAsset.State is null', () => {
    let filter = `vAsset__state is null`;
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    expect(sql.where).toEqual(`"v_asset"."state" IS NULL`);
    expect(sql.parameters).toHaveLength(0);
  });

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
/*
  it('cast', () => {
    let filter = `contains(cast('clients',Edm.String), 'Scup')`;
    let sql = createFilter(filter); // map $filter OData to pgSql statement
    console.log(sql.where);
   // expect(sql.where).toEqual('"clients" = :0');

   

   
  });
  */

  it('multi_contains', () => {
    let filter = `( contains(bmsticketorder__meta->>'selectedBinLoc', 'Steve Jo') or contains(ticketNumber,'Steve Jo')  or contains(orderId,'Steve Jo')  or contains(accountName,'Steve Jo')  or contains(name,'Steve Jo')  or contains(partNumber,'Steve Jo')  or contains(description,'Steve Jo')  or contains(priority,'Steve Jo')  or contains(subIssueType,'Steve Jo')  or contains(outTrackingNumber,'Steve Jo')  or contains(outShipStatus,'Steve Jo')  or contains(shiptoAddress->>'city','Steve Jo')  or contains(shiptoAddress->>'state','Steve Jo')  or contains(shiptoAddress->>'email','Steve Jo')  or contains(shiptoAddress->>'name','Steve Jo')  or contains(shiptoAddress->>'postalCode','Steve Jo')  or contains(shiptoAddress->>'street','Steve Jo')  or contains(shiptoAddress->>'country','Steve Jo')  or contains(bmsticket__status,'Steve Jo')  or contains(orderReason,'Steve Jo')  or contains(primaryAssignee,'Steve Jo')  )`;
    let sql = createFilter(filter); // map $filter OData to pgSql statement
  
    //expect(sql.where).toEqual('"issue_type" = :0');
    //expect(sql.parameters).toHaveLength(1);
    //expect(sql.parameterObject()).toEqual({ 0: 'Onboarding / Build'});

  });


})
