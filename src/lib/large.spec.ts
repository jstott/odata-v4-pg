
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