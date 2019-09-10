# OData V4 Service modules - PostgreSQL Connector

Service OData v4 requests from a PostgreSQL data store for Objection.js (knex.js) ORM for Node.js

> This is a modified and specific version of odata-v4-pg.  As work continues, this library will be moved to something more appropriately named.

## Synopsis
The OData V4 PostgreSQL Connector provides functionality to convert the various types of OData segments
into SQL query statements suitable for Objection / knex.js raw() where clause

## Snake_Case conversion
This library assumes your Nest/Objection/knex are leveraging Postgre snake_case for table names.
As such, OData queries for camelCase properties will be converted to snake_case automatically.

## Named bindings
In knex.js - Named bindings such as :name are interpreted as values and :name: interpreted as identifiers. Named bindings are processed so long as the value is anything other than undefined.

As such, odata-v4-pg will set placeholders as :0 (index value) for all placeholders.
This helps alleviate issues for `createDate eq null` statements, that are absent of any placeholders. With named bindings, this does not present a problem.

## Potential usage scenarios

- Nest.js & Objection.js (or direct Knex.js) library helper

See the (index.spec.ts)[./src/lib/index.spec.ts] for sanity tests

## Usage as server - TypeScript

```javascript
import { createFilter } from 'odata-v4-pg'

//example request/query filter:  
const { raw } = require('objection');
const sDay = moment.utc().startOf('day').toISOString();
const query = { $filter: `(startDate ne null or startDate ge '${moment.utc().startOf('day').toISOString()}')`, $expand: '' };
Object.assign(query, req.query || {});


await Person
  .query()
  .where(raw(query.where, query.parameterObject()));
}
```



## Supported OData segments

* $filter
* $select
* $skip
* $top
* $orderby
* $expand