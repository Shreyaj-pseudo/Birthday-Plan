# Nine slices

A local birthday experience: an opening video dedication, followed by nine interactive 3D cake slices and the friends’ stories behind them.

## Run

Install Node.js 22 or newer, then run `npm install` and `npm run dev`. Open the localhost address printed in the terminal.

For the birthday, run `npm run build`, then `npm run preview`. Keep the terminal open during the presentation. The built site uses only local assets and works without an internet connection. It must be served through localhost; opening `dist/index.html` directly is not supported.

## Add your content

Edit `src/content.ts`. Set `birthday.recipient` to her name. Put your opening video in `public/videos/intro.mp4` and set `birthday.intro.video` to `/videos/intro.mp4`.

Each of the nine slice entries has an editable friend name, flavor, video path, optional poster image, and appearance. The last argument in each sample `slice(...)` call sets the placeholder friend number. You can replace the generated entries with explicit objects, or change the helper to accept your friend names and video paths. For example:

```ts
{
  id: 'red-velvet',
  friend: 'Actual friend name',
  flavor: 'Red velvet',
  video: '/videos/red-velvet.mp4',
  poster: '/videos/red-velvet.jpg', // optional
  appearance: {
    sponge: '#882f35', filling: '#f7e5ce', frosting: '#f7e5ce',
    topping: 'berries', accent: '#a52c3c',
  },
}
```

Start with your existing red velvet and nutty chocolate videos. The seven other flavors and all friend names are sample content. Keep exactly nine entries and keep their IDs stable, since watched progress uses those IDs. Available toppings: `berries`, `nuts`, `petals`, `chocolate`, `lemon`. Video paths are relative to `public`, so do not include `public` in the configured URL.

Use browser-compatible MP4 files (H.264 video with AAC audio). Both portrait and landscape videos are shown uncropped. Leave a video path empty to show the intentional placeholder. A missing or unsupported file shows an error and retry button. Videos never autoplay. Rebuild after changing content or assets.

## Present and rehearse

Explore in any order. Drag horizontally to rotate, click a slice or use the labeled buttons beneath the cake, and press Escape to close a message. A story counts as watched when playback ends. Watched progress stays in this browser; “Reset watched stories” clears it. “Your opening message” returns to your dedication. The mobile player is a dialog, and the slice buttons remain usable if WebGL is unavailable.

Run `npm test` for interaction tests and `npm run build` for TypeScript and production checks. Before the birthday, play each real video on the presentation laptop, verify volume and codec support, and rehearse once with the internet disconnected. This version has no hosting, password, upload portal, or external services. Local fonts are bundled from Fontsource.

With `npm run preview` running at port 4173 and Google Chrome installed, run `node tests/browser.mjs` for desktop/mobile browser checks, actual 3D click and drag checks, keyboard focus, and the WebGL fallback. Screenshots are saved in the ignored `.artifacts` directory. The browser check also verifies that the site requests no external assets.
