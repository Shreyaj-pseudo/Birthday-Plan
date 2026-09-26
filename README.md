# Nine slices

A birthday website for a laptop presentation: a candlelit introduction, your video message, and an interactive cake assembled from nine friends' chosen slices. Every wedge can open its friend's video. The site runs locally and has no backend or external runtime assets.

## Run it

Use Node.js 22 or newer. Run `npm ci` followed by `npm run dev`, then open the local address printed in the terminal. To present the production build, run `npm run build` and `npm run preview`; keep the terminal open. Do not open `dist/index.html` directly. The site can be presented offline once dependencies are installed and it has been built.

The presentation is designed for a laptop screen wider than 900 pixels. Smaller screens show a laptop notice.

## Add the real names and videos

Edit `src/content.ts`. Set `birthday.recipient` to her name and set `birthday.intro.video` to the local path of your birthday message, such as `/videos/intro.mp4`.

Add each friend's video to `public/videos/` and update that slice's `video` argument. The complete filename guide is in `public/videos/README.md`. All nine flavors and friend names are configured; video fields stay empty until the actual files arrive, so the site shows its intentional placeholder instead of requesting a missing file. For example, `public/videos/red-velvet-diya.mp4` is connected by changing Diya's video argument to `/videos/red-velvet-diya.mp4`.

Keep exactly nine slices and stable IDs because watched progress is stored by ID in the browser. The site shows intentional placeholders for videos that have not arrived. Use MP4 with H.264 video and AAC audio for broad browser support. Test the actual files and sound on the presentation laptop before the birthday. Videos do not autoplay, and a watched marker appears only after playback finishes. The reset button clears watched progress for rehearsals.

## Visual assets

`public/images/cake-top.webp` maps onto the nine individually clickable 3D wedge tops. The sponge and filling sides are generated as crisp layered materials so they remain stable while the cake rotates. The landing and cake scene use separate candlelit photographs in the same folder. These are AI-generated decorative assets and sample flavor imagery; they are not photos or messages from her friends. Source PNGs are kept under `assets/source-images/`. If you change a source image, run `node tests/prepare-assets.mjs` to re-encode the WebP assets.

## Verify

Run `npm test` for React interaction tests and `npm run build` for TypeScript and production checks. With the preview running on `http://127.0.0.1:4173` and Google Chrome installed, run `node tests/browser.mjs` for the laptop layout, cake click and drag, keyboard and video behavior, offline asset checks, and a fallback when WebGL is unavailable. Screenshots are saved in the ignored `.artifacts/` directory.
