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


## Samples

**Equality Check**

- `$filter=category eq 'Books'`
- `$filter=price eq 19.99`

**Inequality Check**

- `$filter=price ne 19.99`
- `$filter=category ne 'Electronics'`

**Greater Than / Less Than**

- `$filter=price gt 19.99`
- `$filter=price lt 50.00`
- `$filter=price ge 19.99`
- `$filter=price le 50.00`

**Logical Operators**

- `$filter=price gt 19.99 and price lt 50.00`
- `$filter=category eq 'Books' or category eq 'Electronics'`

**Null Checks**

- `$filter=category is null`
- `$filter=category is not null`
- `$filter=category is nullOrEmpty`

**String Functions**

- `$filter=startswith(name, 'A')`
- `$filter=endswith(name, 'Z')`
- `$filter=contains(description, 'discount')`

**Arithmetic Operations**

- `$filter=price add 5 eq 24.99`
- `$filter=price sub 5 eq 14.99`
- `$filter=price mul 2 eq 39.98`
- `$filter=price div 2 eq 9.99`
- `$filter=price mod 5 eq 4.99`

**Date Functions**

- `$filter=date eq 2023-01-01`
- `$filter=date gt 2023-01-01`
- `$filter=date lt 2023-12-31`

**Boolean Functions**

- `$filter=isActive eq true`
- `$filter=isActive eq false`

**Complex Expressions**

- `$filter=(price gt 19.99 and price lt 50.00) or (category eq 'Books' and isActive eq true)`
- `$filter=(startswith(name, 'A') or endswith(name, 'Z')) and price le 100.00`




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
`npm version patch` or `npm version prerelease`

After changing the version number in your package.json, run `npm publish` to publish the new version to NPM.

`npm install` will install the latest version in the NPM repository.

Complete sequence

```
npm run build
<commit changes>
npm version prerelease
git push
git push --tags 
npm publish
```


## Other

### Build Error: odata-v4-server

The latest version of odata-v4-server shows a build error as:

```
node_modules/odata-v4-server/build/lib/processor.d.ts:20:22 - error TS2415: Class 'ODataProcessor' incorrectly extends base class 'Transform'.
  Property '_flush' is protected in type 'ODataProcessor' but public in type 'Transform'.
```
One workaround is  TypeScript can build project if pass option tsc --skipLibCheck, so this was added to the build scripts.  [Ref this github issue](https://github.com/jaystack/odata-v4-server/issues/35)
