const { createFilter } = require('./build/lib/index.js');

// Test edge cases and variations to understand any potential issues
const filters = [
    // Original reported filter
    "(contains(asset__category,'Camera') or asset__state eq 'Expired')",
    
    // Test with spaces
    "( contains(asset__category,'Camera') or asset__state eq 'Expired' )",
    
    // Test with different quote styles
    "(contains(asset__category,\"Camera\") or asset__state eq \"Expired\")",
    
    // Test without outer parentheses
    "contains(asset__category,'Camera') or asset__state eq 'Expired'",
    
    // Test nested parentheses
    "((contains(asset__category,'Camera')) or (asset__state eq 'Expired'))",
    
    // Test with AND condition
    "(contains(asset__category,'Camera') and asset__state eq 'Expired')",
    
    // Test multiple OR conditions
    "(contains(asset__category,'Camera') or asset__state eq 'Expired' or asset__state eq 'Active')",
    
    // Test complex nested conditions
    "((contains(asset__category,'Camera') or contains(asset__category,'Lens')) and (asset__state eq 'Expired' or asset__state eq 'Active'))"
];

filters.forEach((filterExpression, index) => {
    console.log(`\n=== Test ${index + 1} ===`);
    console.log("Filter:", filterExpression);
    
    try {
        const result = createFilter(filterExpression);
        console.log("WHERE clause:", result.where);
        console.log("Parameters:", result.parameters);
        console.log("Parameter Object:", JSON.stringify(result.parameterObject()));
    } catch (error) {
        console.error("Error:", error.message);
    }
});