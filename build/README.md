# Build Resources

This directory contains resources needed for building the Electron application.

## Required Icons

For proper app packaging, you need these icon files:

- `icon.ico` - Windows icon (256x256)
- `icon.icns` - macOS icon bundle
- `icon.png` - Linux icon (512x512)

## Creating Icons from SVG

You can use online converters or tools like:

1. **For Windows (.ico):**

   - Use online converters like convertio.co
   - Upload `public/logo/green.svg`
   - Convert to ICO format with multiple sizes (16, 32, 48, 256)

2. **For macOS (.icns):**

   - Use online converters or Image2icon app
   - Convert SVG to ICNS with multiple resolutions

3. **For Linux (.png):**
   - Export SVG to PNG at 512x512 resolution
   - Use online tools or image editors

## Current Status

- ✅ SVG logo copied
- ❌ ICO file needed for Windows
- ❌ ICNS file needed for macOS
- ❌ PNG file needed for Linux

The app will build without these icons but will use default Electron icons.
