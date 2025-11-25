# Template Override Files

Place your custom files here to override default template values.

## Supported Overrides

### Branding Files
- `logo.svg` - Your store logo (will replace `/icon.svg`)
- `favicon.svg` - Your favicon (will replace `/icon.svg`)
- `apple-icon.svg` - Apple touch icon (will replace `/apple-icon.svg`)

### Configuration Files
- `branding.json` - Override branding values (merges with default)
- `env.local.json` - Override environment variables (merges with default)

## How It Works

1. Place your custom files in this directory
2. Run `npm run apply-branding` to apply overrides
3. Your custom files will be copied to the appropriate locations

## File Naming

Files in this directory should match the target file names:
- `logo.svg` → copied to `app/icon.svg` and `app/apple-icon.svg`
- `branding.json` → merged with `template/config/branding.json`

