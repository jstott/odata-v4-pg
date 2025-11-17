
import { mocked } from 'ts-jest/utils'

import { createFilter } from './index';
import { raw } from 'objection';

describe('inventoryFilter', () => {
  /*
    it('eq null', () => {
        let filter = `category eq null`;
        let sql = createFilter(filter); // map $filter OData to pgSql statement
       // console.log(sql.where);
       expect(sql.where).toEqual(`"category" IS NULL`)
      });
      */

    it('isnull', () => {
        let filter = `category is null`;
        let sql = createFilter(filter); // map $filter OData to pgSql statement
        //console.log(sql.where);
        expect(sql.where).toEqual(`"category" IS NULL`);
      }); 

   it('inventory-filter-1', () => {
    let filter = `( contains(accountName,'Pr') or contains(serialNumbersAsString, 'Pr') or contains(type,'Pr')  or contains(partNumber,'Pr')  or contains(partName,'Pr')  or contains(description,'Pr')  or contains(state,'Pr')  or contains(categoryName,'Pr')  ) and ((state ne 'Assigned' or state is null) and (contains(categoryName,'Camera')  or contains(categoryName,'Windows')  or contains(categoryName,'Linux') ))`;
    let sql = createFilter(filter); // map $filter OData to pgSql statement
   // console.log(sql.where);
    expect(sql.where).toEqual(`(\"account_name\" ~* :0 OR \"serial_numbers_as_string\" ~* :1 OR \"type\" ~* :2 OR \"part_number\" ~* :3 OR \"part_name\" ~* :4 OR \"description\" ~* :5 OR \"state\" ~* :6 OR \"category_name\" ~* :7) AND ((\"state\" <> :8 OR \"state\" IS NULL) AND (\"category_name\" ~* :9 OR \"category_name\" ~* :10 OR \"category_name\" ~* :11))`);
    //expect(sql.parameters).toHaveLength(2);
  }); 


  
  it('inventory-filter-2', () => {
    let filter = `( contains(accountName,'Pr') or contains(uom,'Pr') or contains(serialNumbersAsString, 'Pr') or contains(type,'Pr')  or contains(partNumber,'Pr')  or contains(partName,'Pr')  or contains(description,'Pr')  or contains(state,'Pr')  or contains(categoryName,'Pr')  ) and ( (state is null or state ne 'Assigned') and (contains(categoryName,'Camera')  or contains(categoryName,'Windows')  or contains(categoryName,'Linux') ))`;
    let sql = createFilter(filter); // map $filter OData to pgSql statement
   // console.log(sql.where);
    expect(sql.where).toEqual(`(\"account_name\" ~* :0 OR \"uom\" ~* :1 OR \"serial_numbers_as_string\" ~* :2 OR \"type\" ~* :3 OR \"part_number\" ~* :4 OR \"part_name\" ~* :5 OR \"description\" ~* :6 OR \"state\" ~* :7 OR \"category_name\" ~* :8) AND ((\"state\" IS NULL OR \"state\" <> :9) AND (\"category_name\" ~* :10 OR \"category_name\" ~* :11 OR \"category_name\" ~* :12))`);
    //expect(sql.parameters).toHaveLength(2);
  }); 

  // Test case for the reported issue: nested OR condition with contains and eq
  it('nested-or-contains-and-eq', () => {
    let filter = `(contains(asset__category,'Camera') or asset__state eq 'Expired')`;
    let sql = createFilter(filter);
    
    // Both parts should be present in the WHERE clause
    expect(sql.where).toEqual(`(\"asset\".\"category\" ~* :0 OR \"asset\".\"state\" = :1)`);
    expect(sql.parameters).toHaveLength(2);
    expect(sql.parameters[0]).toEqual('Camera');
    expect(sql.parameters[1]).toEqual('Expired');
    expect(sql.parameterObject()).toEqual({ '0': 'Camera', '1': 'Expired' });
  });

  // Test case for variations of the nested OR condition
  it('nested-or-variations', () => {
    // Without outer parentheses
    let filter1 = `contains(asset__category,'Camera') or asset__state eq 'Expired'`;
    let sql1 = createFilter(filter1);
    expect(sql1.where).toEqual(`\"asset\".\"category\" ~* :0 OR \"asset\".\"state\" = :1`);
    expect(sql1.parameters).toEqual(['Camera', 'Expired']);

    // With extra nested parentheses
    let filter2 = `((contains(asset__category,'Camera')) or (asset__state eq 'Expired'))`;
    let sql2 = createFilter(filter2);
    expect(sql2.where).toEqual(`((\"asset\".\"category\" ~* :0) OR (\"asset\".\"state\" = :1))`);
    expect(sql2.parameters).toEqual(['Camera', 'Expired']);

    // Multiple OR conditions
    let filter3 = `(contains(asset__category,'Camera') or asset__state eq 'Expired' or asset__state eq 'Active')`;
    let sql3 = createFilter(filter3);
    expect(sql3.where).toEqual(`(\"asset\".\"category\" ~* :0 OR \"asset\".\"state\" = :1 OR \"asset\".\"state\" = :2)`);
    expect(sql3.parameters).toEqual(['Camera', 'Expired', 'Active']);
  });

  // Test case for complex nested conditions combining AND and OR
  it('complex-nested-and-or', () => {
    let filter = `((contains(asset__category,'Camera') or contains(asset__category,'Lens')) and (asset__state eq 'Expired' or asset__state eq 'Active'))`;
    let sql = createFilter(filter);
    
    expect(sql.where).toEqual(`((\"asset\".\"category\" ~* :0 OR \"asset\".\"category\" ~* :1) AND (\"asset\".\"state\" = :2 OR \"asset\".\"state\" = :3))`);
    expect(sql.parameters).toHaveLength(4);
    expect(sql.parameters).toEqual(['Camera', 'Lens', 'Expired', 'Active']);
    expect(sql.parameterObject()).toEqual({ 
      '0': 'Camera', 
      '1': 'Lens', 
      '2': 'Expired', 
      '3': 'Active' 
    });
  });
 

  /* it('issue', () => {
    //let filter = `(contains(accountName,'Pr') or contains(uom,'Pr') or contains(serialNumbersAsString, 'Pr') or contains(type,'Pr')  or contains(partNumber,'Pr')  or contains(partName,'Pr')  or contains(description,'Pr')  or contains(state,'Pr')  or contains(categoryName,'Pr')) and  (state eq null or state ne 'Assigned') and (contains(categoryName,'Camera')  or contains(categoryName,'Windows')  or contains(categoryName,'Linux') )`;
    //let filter = `( contains(accountName,'Pr') or contains(uom,'Pr') or contains(serialNumbersAsString, 'Pr') or contains(type,'Pr')  or contains(partNumber,'Pr')  or contains(partName,'Pr')  or contains(description,'Pr')  or contains(state,'Pr')  or contains(categoryName,'Pr')  ) and ( (state eq null or state ne 'Assigned') and (contains(categoryName,'Camera')  or contains(categoryName,'Windows')  or contains(categoryName,'Linux') ))`;
    let filter = `( contains(accountName,'S3') or contains(serialNumbersAsString, 'S3') or contains(type,'S3')  or contains(partNumber,'S3')  or contains(partName,'S3')  or contains(description,'S3')  or contains(productName,'S3')  or contains(state,'S3')  or contains(uom,'S3')  or contains(searchKeys,'S3')  or contains(categoryName,'S3')  or contains(accountCode,'S3')  or contains(notes,'S3')  or contains(dimensions,'S3')  or contains(hscode,'S3')  or contains(owner,'S3') ) and (state is null or state ne 'Assigned') and (contains(categoryName,'Camera')  or contains(categoryName,'Windows')  or contains(categoryName,'Linux')  or contains(categoryName,'Misc') )`;

    let sql = createFilter(filter); // map $filter OData to pgSql statement
   console.log(sql.where);
    //expect(sql.where).toEqual('"issue_type" = :0');
    //expect(sql.parameters).toHaveLength(1);
    //expect(sql.parameterObject()).toEqual({ 0: 'Onboarding / Build'});

  }); */


  


})