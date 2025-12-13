# PRSM-Allergy
Main website for PRSM Allergy.
echo "# PRSM-Allergy" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/rojeapen/PRSM-Allergy.git
git push -u origin main

## Photo Gallery

A simple photo gallery was added under the `#gallery` section in `index.html`.

How it works
- The gallery stage uses images from `assets/gallery/`.
- Thumbnails are placed in the `.gallery-thumbs` area and correspond to the images in the stage.
- Click/tap the left or right side of the big image (or use the left/right arrow keys) to navigate between images.

Customizing
- Add your photos to `assets/gallery/` (keep the filenames consistent and add matching `<img>` tags in the gallery markup).
- To change the number of images, add/remove `<img class="gallery-img">` elements in the `.gallery-track` and matching `<button class="thumb" data-index="N">` entries in `.gallery-thumbs`.
- Styling is in `styles.css` under the `/* Gallery */` section. Change sizes, preview width and transitions there.

Accessibility
- Thumbnails have `aria-pressed` toggled to indicate the selected image.
- Navigation buttons have `aria-label` text for screen readers.

If you'd like, I can make the gallery automatically detect images in `assets/gallery/` so you only need to drop images in the folder (and JS will create thumbnails automatically).

Notes about image formats
- Some browsers do not support HEIC images (commonly produced by iPhones). The gallery attempts to detect when an image fails to load and will try common fallbacks (JPEG/PNG) and finally use a provided SVG thumbnail as a fallback.
- For best compatibility and performance, convert HEIC images to JPEG or WebP before deploying (tools: `sips` on macOS, `imagemagick`, or online converters).
