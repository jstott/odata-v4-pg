# OData V4 Service modules - PostgreSQL Connector

Service OData v4 requests from a PostgreSQL data store for Objection.js (knex.js) ORM for Node.js

> This is a modified and specific version of odata-v4-pg.  As work continues, this library will be moved to something more appropriately named.

## 2.0  Breaking Changes (potential if you rely on case sensitive)

OData pattern matching operators [contains, substringof, startswith, endswith] have been changed to resolve to  `ILIKE` or `~*` from `LIKE`:
|Operator     | PG Operator   | Sample                   | 
| ----------- | --------------| -------                  |
| contains    | ~* (regex)    | `"status" ~* 'jen'`      |
| substringof | ILIKE         | `"status" ILIKE '%jen%'` |
| startswith  | ILIKE         | `"status" ILIKE 'jen%'`  |
| endswith    | ILIKE         | `"status" ILIKE '%jen'`  |

Contains with regex can perform a little better than ILIKE, your milage may certainly very.

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
const filter = createFilter(query.$filter); // map $filter OData to pgSql statement

await Person
  .query()
  .where(raw(filter.where, filter.parameterObject()));
}
```



## Supported OData segments

* $filter
* $select
* $skip
* $top
* $orderby
* $expand

## NPM package
Change the version in your package.json or use npm version <new-version>.
`npm version patch`

After changing the version number in your package.json, run `npm publish` to publish the new version to NPM.

`npm install` will install the latest version in the NPM repository.

## Other

### Build Error: odata-v4-server

The latest version of odata-v4-server shows a build error as:

```
node_modules/odata-v4-server/build/lib/processor.d.ts:20:22 - error TS2415: Class 'ODataProcessor' incorrectly extends base class 'Transform'.
  Property '_flush' is protected in type 'ODataProcessor' but public in type 'Transform'.
```
One workaround is  TypeScript can build project if pass option tsc --skipLibCheck, so this was added to the build scripts.  [Ref this github issue](https://github.com/jaystack/odata-v4-server/issues/35)
