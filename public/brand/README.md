# Brand Assets Folder

Place your custom brand assets in this folder:

- `logo.png` - Main store logo (recommended: 200x200px or larger)
- `favicon.png` - Browser favicon (recommended: 32x32px or 64x64px)
- `apple-icon.png` - Apple touch icon (recommended: 180x180px)
- `og.jpg` - Open Graph image for social sharing (recommended: 1200x630px)

## File Naming

The files should be named exactly as shown above. The brand configuration in `brand.config.ts` references these paths.

## Fallbacks

If any file is missing, the system will automatically fall back to:
- `/icon.svg` for logo and favicon
- `/apple-icon.svg` for Apple icon
- Logo for OG image

## Usage

After placing your files, update `brand.config.ts` if needed (paths are already configured by default).

