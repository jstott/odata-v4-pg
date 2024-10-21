import { mocked } from 'ts-jest/utils'

import { createFilter } from './index';
import { raw } from 'objection';

describe('samples', () => {

    it('isNotNullAndExpression', () => {
        let filter = `(inReceiptDate is not null) and (ticketStatus eq 'Scheduled')`;
        let sql = createFilter(filter); // map $filter OData to pgSql statement
        //console.log(sql.where);
        expect(sql.where).toEqual(`("in_receipt_date" IS NOT NULL) AND ("ticket_status" = :0)`);
      }); 

      it('isNotNullAndExpression', () => {
        let filter = `((inReceiptDate is not null) and (ticketStatus eq 'Scheduled'))`;
        let sql = createFilter(filter); // map $filter OData to pgSql statement
        //console.log(sql.where);
        //expect(sql.where).toEqual(`(("in_receipt_date" IS NOT NULL) AND ("ticket_status" = :0))`);
      }); 
});

