# Release Process

This project uses GitHub Actions to automate plugin releases with reproducible builds and supply chain security best practices.

## Creating a Release

### Option 1: Manual Workflow Trigger (Recommended)

1. Go to **Actions** tab in GitHub
2. Select **Release Plugin** workflow
3. Click **Run workflow**
4. Enter the version number (e.g., `1.0.1`)
5. Click **Run workflow** button

The workflow will:
- Build the plugin from source
- Create a GitHub release with the version tag
- Upload the plugin package as a release asset

### Option 2: Push a Version Tag

```bash
git tag v1.0.1
git push origin v1.0.1
```

The workflow will automatically trigger and create the release.

## Version Numbering

We use semantic versioning (MAJOR.MINOR.PATCH):

- **PATCH** (1.0.X): Bug fixes and minor updates
- **MINOR** (1.X.0): New features, backwards compatible
- **MAJOR** (X.0.0): Breaking changes

## Before Releasing

1. Update `package.json` and `manifest.json` with the new version
2. Test the plugin locally with `npm run build`
3. Commit version changes
4. Push to main branch
5. Create the release using one of the methods above

## Release Artifacts

Each release includes:
- `struct-figma-plugin-{version}.zip` - Complete plugin package ready for Figma installation

## Security

The workflow follows 2026 supply chain security best practices:
- All GitHub Actions are pinned to specific commit SHAs
- Builds are reproducible from source
- Full audit trail in GitHub Actions logs
