const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..');
const iconSrc = path.join(rootDir, 'public', 'android-chrome-512x512.png');
const appIconSrc = fs.existsSync(iconSrc) ? iconSrc : path.join(rootDir, 'public', 'icon.png');

async function generateAssets() {
  console.log('Generating Android and iOS icons & splash screens from:', appIconSrc);

  // 1. Android Mipmaps
  const mipmaps = [
    { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
  ];

  for (const m of mipmaps) {
    const targetDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res', m.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // ic_launcher.png
    await sharp(appIconSrc)
      .resize(m.size, m.size)
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // ic_launcher_round.png
    await sharp(appIconSrc)
      .resize(m.size, m.size)
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png
    await sharp(appIconSrc)
      .resize(m.fgSize, m.fgSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));
  }

  // 2. Android Splash screens
  const splashDrawables = [
    { dir: 'drawable', w: 1080, h: 1920 },
    { dir: 'drawable-port-mdpi', w: 320, h: 480 },
    { dir: 'drawable-port-hdpi', w: 480, h: 800 },
    { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
    { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
    { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
    { dir: 'drawable-land-mdpi', w: 480, h: 320 },
    { dir: 'drawable-land-hdpi', w: 800, h: 480 },
    { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
    { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
    { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 },
  ];

  for (const s of splashDrawables) {
    const dir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res', s.dir);
    if (fs.existsSync(dir)) {
      const iconResized = await sharp(appIconSrc).resize(Math.round(Math.min(s.w, s.h) * 0.4)).toBuffer();
      await sharp({
        create: {
          width: s.w,
          height: s.h,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      })
        .composite([{ input: iconResized, gravity: 'center' }])
        .png()
        .toFile(path.join(dir, 'splash.png'));
    }
  }

  // 3. iOS AppIcon
  const iosIconDir = path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
  if (fs.existsSync(iosIconDir)) {
    await sharp(appIconSrc)
      .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(iosIconDir, 'AppIcon-512@2x.png'));
    console.log('Generated iOS AppIcon (1024x1024)');
  }

  // 4. iOS Splash
  const iosSplashDir = path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset');
  if (fs.existsSync(iosSplashDir)) {
    const splashFiles = ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png'];
    const iconResized = await sharp(appIconSrc).resize(600, 600).toBuffer();
    for (const file of splashFiles) {
      await sharp({
        create: {
          width: 2732,
          height: 2732,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      })
        .composite([{ input: iconResized, gravity: 'center' }])
        .png()
        .toFile(path.join(iosSplashDir, file));
    }
    console.log('Generated iOS Splash screens (2732x2732)');
  }

  console.log('All mobile assets successfully generated!');
}

generateAssets().catch((err) => {
  console.error('Failed to generate assets:', err);
  process.exit(1);
});
