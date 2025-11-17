# OData Filter Analysis: Nested OR Condition Issue

## Problem Statement
The reported issue was that the OData parser was "not correctly handling the nested OR condition `(contains(asset__category,'Camera') or asset__state eq 'Expired')`. It's only processing the `asset__state eq 'Expired'` part and ignoring the Camera category filter entirely."

## Investigation Results

### Testing the Problematic Filter
After thorough testing, the OData parser is **working correctly**. The filter:
```
(contains(asset__category,'Camera') or asset__state eq 'Expired')
```

Produces the expected SQL output:
```sql
WHERE ("asset"."category" ~* :0 OR "asset"."state" = :1)
```

With parameters:
```javascript
{
  "0": "Camera",
  "1": "Expired"
}
```

### Test Results Summary

| Filter | WHERE Clause | Parameters |
|--------|-------------|------------|
| `(contains(asset__category,'Camera') or asset__state eq 'Expired')` | `("asset"."category" ~* :0 OR "asset"."state" = :1)` | `['Camera', 'Expired']` |
| `contains(asset__category,'Camera') or asset__state eq 'Expired'` | `"asset"."category" ~* :0 OR "asset"."state" = :1` | `['Camera', 'Expired']` |
| `((contains(asset__category,'Camera')) or (asset__state eq 'Expired'))` | `(("asset"."category" ~* :0) OR ("asset"."state" = :1))` | `['Camera', 'Expired']` |

### Key Findings

1. **Both parts of the OR condition are processed correctly**
   - The `contains()` function becomes `~*` (PostgreSQL regex match)
   - The `eq` operator becomes `=`
   - Both conditions are properly joined with `OR`

2. **Parameter binding is correct**
   - Parameter `:0` contains `'Camera'`
   - Parameter `:1` contains `'Expired'`

3. **Column name conversion works as expected**
   - `asset__category` becomes `"asset"."category"`
   - `asset__state` becomes `"asset"."state"`

## Possible Sources of the Original Issue

Since the parser works correctly, the issue in the other project might be:

1. **Parameter Binding Issues**: The SQL query is correct, but parameters aren't being bound properly when executed
2. **Query Execution Context**: The query might be running in a context where one of the conditions doesn't match expected data
3. **Data Issues**: The data might not contain expected values
4. **Framework/ORM Issues**: The consuming application might not be passing parameters correctly to the database
5. **Caching Issues**: Old/cached query results might be displayed

## Test Cases Added

Added comprehensive test cases to `src/lib/large.spec.ts`:

- `nested-or-contains-and-eq`: Tests the exact reported filter
- `nested-or-variations`: Tests variations with/without parentheses 
- `complex-nested-and-or`: Tests complex nested AND/OR combinations

These tests will help prevent regressions and ensure the parser continues to work correctly.

## Recommendations

1. **In the consuming project**: 
   - Verify parameter binding in the ORM/query framework
   - Check that the generated SQL is being executed as expected
   - Validate that database contains expected data
   - Enable SQL query logging to see actual executed queries

2. **For debugging**:
   - Log the actual SQL query being sent to the database
   - Log the parameter values being bound
   - Test the raw SQL query directly in the database

3. **For validation**:
   - Use the debug script `debug-filter-test.js` to verify parser output
   - Run the test suite to ensure parser functionality

## Debug Script Usage

```bash
node debug-filter-test.js
```

This script tests various filter expressions and shows the generated SQL and parameters.