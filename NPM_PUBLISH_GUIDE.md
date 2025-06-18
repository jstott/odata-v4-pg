# NPM Publishing Guide

A step-by-step guide for publishing updates to the `@jwstott/odata-v4-pg` package.

## Prerequisites

- [ ] Ensure you're logged into npm: `npm whoami`
- [ ] If not logged in: `npm login`
- [ ] All code changes are complete and tested
- [ ] Working directory is clean (no uncommitted changes)

## Publishing Workflow

### 1. Pre-Publish Checks

#### Verify Local Linking (if using local dependencies)
```bash
# Check if using local linked packages
npm ls @jwstott/odata-v4-parser

# Should show something like:
# └── @jwstott/odata-v4-parser@x.x.x -> ./../odata-v4-parser
```

#### Run Full Test Suite
```bash
npm test
```
All tests must pass before proceeding.

#### Check Current Version
```bash
# Check current version in package.json
grep '"version"' package.json
```

### 2. Determine Version Type

Choose the appropriate version bump based on your changes:

- **Patch** (`x.x.1`) - Bug fixes, small improvements
- **Minor** (`x.1.x`) - New features, backward compatible
- **Major** (`1.x.x`) - Breaking changes

### 3. Update Version

```bash
# For bug fixes (most common)
npm version patch

# For new features
npm version minor

# For breaking changes
npm version major
```

This command will:
- Update `package.json` version
- Create a git commit
- Create a git tag

### 4. Final Build and Test

```bash
# Ensure latest build
npm run build

# Final test run
npm test
```

### 5. Publish to NPM

```bash
npm publish
```

If prompted for 2FA, follow the authentication flow.

### 6. Push to Git Repository

```bash
# Push commits and tags to remote
git push origin master --tags
```

## Post-Publish Verification

### Verify Package is Live
```bash
# Check the published package
npm view @jwstott/odata-v4-pg

# Or visit: https://www.npmjs.com/package/@jwstott/odata-v4-pg
```

### Test Installation
```bash
# In a test directory
npm install @jwstott/odata-v4-pg@latest
```

## Troubleshooting

### Authentication Issues
```bash
# If you get authentication errors
npm logout
npm login
```

### Version Already Exists
```bash
# If version already published, bump to next version
npm version patch
npm publish
```

### Build Failures
```bash
# Clean and rebuild
npm run prebuild  # or: rimraf build
npm run build
npm test
```

## Local Development Workflow

### Working with Local Dependencies

If you're using a local linked version of `@jwstott/odata-v4-parser`:

1. **In the parser project**:
   ```bash
   cd ../odata-v4-parser
   npm link
   ```

2. **In this project**:
   ```bash
   npm link @jwstott/odata-v4-parser
   ```

3. **To unlink and use published version**:
   ```bash
   npm unlink @jwstott/odata-v4-parser
   npm install @jwstott/odata-v4-parser
   ```

### Verify Local Linking is Working
```bash
# Check symlink
ls -la node_modules/@jwstott/odata-v4-parser

# Should show: lrwxr-xr-x ... -> ../../../odata-v4-parser
```

## Best Practices

### Before Publishing
- [ ] Update README.md if needed
- [ ] Update CHANGELOG.md with new version notes
- [ ] Ensure all tests pass
- [ ] Run linting if configured
- [ ] Check for any TODO or FIXME comments

### Commit Messages
Use conventional commit format:
```
fix: properly handle table.column format in IsNotNull expressions
feat: add support for new OData operators
docs: update API documentation
```

### Version Semantics
- **1.2.3 → 1.2.4**: Bug fixes, patches
- **1.2.3 → 1.3.0**: New features, enhancements
- **1.2.3 → 2.0.0**: Breaking changes

### Testing After Publish
```bash
# Create a test project
mkdir test-package && cd test-package
npm init -y
npm install @jwstott/odata-v4-pg@latest

# Test basic functionality
node -e "const { createFilter } = require('@jwstott/odata-v4-pg'); console.log(createFilter('name eq test').where);"
```

## Quick Reference Commands

```bash
# Full publish workflow
npm test                    # 1. Test
npm version patch          # 2. Version bump  
npm test                   # 3. Final test
npm publish               # 4. Publish
git push origin master --tags  # 5. Push to git

# Check package status
npm view @jwstott/odata-v4-pg versions --json
npm whoami
npm ls @jwstott/odata-v4-parser
```

## Emergency Procedures

### Unpublish (within 72 hours)
```bash
# DANGER: Only use if absolutely necessary
npm unpublish @jwstott/odata-v4-pg@1.2.x
```

### Deprecate Version
```bash
# Mark a version as deprecated
npm deprecate @jwstott/odata-v4-pg@1.2.x "Bug in this version, use 1.2.y instead"
```

---

## Notes

- Keep this guide updated as the workflow evolves
- Always test in a safe environment first
- Consider using `npm pack --dry-run` to preview what will be published
- Remember that npm packages are public and permanent (after 72 hours)

**Last Updated**: June 16, 2025
