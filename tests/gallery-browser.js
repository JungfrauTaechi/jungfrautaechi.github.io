async (page) => {
  const results = [];
  const check = (condition, message) => { if (!condition) throw new Error(message); results.push(message); };
  const counter = () => page.locator('.photo-count').textContent();
  const expectCounter = async (value) => {
    await page.waitForFunction(value => document.querySelector('.photo-count')?.textContent === value, value);
    check(await counter() === value, `Counter ${value}`);
  };
  const geometry = async () => page.evaluate(() => {
    const strip = document.querySelector('.photo-thumbnails');
    const selected = strip.querySelector('.is-selected');
    const s = strip.getBoundingClientRect(), t = selected.getBoundingClientRect();
    const stage = document.querySelector('.photo-stage').getBoundingClientRect();
    const image = document.querySelector('.photo-stage > img');
    const img = image.getBoundingClientRect();
    const meta = document.querySelector('.photo-meta').getBoundingClientRect();
    const renderedHeight = Math.min(img.width / image.naturalWidth, img.height / image.naturalHeight) * image.naturalHeight;
    const arrow = document.querySelector('.photo-prev').getBoundingClientRect();
    const arrowCenter = (arrow.top + arrow.bottom) / 2;
    const frame = document.querySelector('.photo-gallery-fullscreen');
    return {
      selectedVisible: t.left >= s.left - 1 && t.right <= s.right + 1,
      thumbnailBottomVisible: t.top >= s.top - 1 && t.bottom <= s.top + strip.clientHeight + 1,
      photoMeetsFooter: getComputedStyle(image).objectPosition === '50% 100%' && meta.top - img.bottom <= 12,
      arrowsAlongsidePhoto: arrowCenter >= img.bottom - renderedHeight && arrowCenter <= img.bottom,
      noVerticalStripScroll: strip.scrollHeight <= strip.clientHeight + 1,
      stripInViewport: s.bottom <= innerHeight + 1 && s.left >= -1 && s.right <= innerWidth + 1,
      imageContained: img.top >= stage.top - 1 && img.bottom <= stage.bottom + 1,
      frameFits: frame.scrollHeight <= frame.clientHeight + 1 && frame.scrollWidth <= frame.clientWidth + 1,
      thumbnailSize: [Math.round(t.width), Math.round(t.height)],
      viewport: [innerWidth, innerHeight],
    };
  });
  const verifyGeometry = async (label) => {
    await page.locator('.photo-stage > img').evaluate(image => image.decode());
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const value = await geometry();
    for (const key of ['selectedVisible', 'thumbnailBottomVisible', 'photoMeetsFooter', 'arrowsAlongsidePhoto', 'noVerticalStripScroll', 'stripInViewport', 'imageContained', 'frameFits']) check(value[key], `${label}: ${key} ${JSON.stringify(value)}`);
  };
  for (const [route, total] of [['/fotos/annecy2026', 91], ['/news/17-01', 2]]) {
    await page.goto('http://127.0.0.1:4173' + route);
    await page.setViewportSize({width:1440, height:900});
    // Reserve a classic Windows scrollbar, including when the host defaults to overlay scrollbars.
    await page.addStyleTag({content:'.photo-thumbnails{scrollbar-width:auto!important}.photo-thumbnails::-webkit-scrollbar{height:17px!important}'});
    await page.getByRole('button', {name:/Vollbild öffnen:/}).click();
    await page.waitForFunction(() => !!document.fullscreenElement);
    check(await page.getByRole('button', {name:/Vollbild schliessen:/}).evaluate(el => el === document.activeElement), `${route}: entry focuses Close`);
    await page.keyboard.press('ArrowRight');
    await expectCounter(`2 / ${total}`);
    await page.keyboard.press('ArrowLeft');
    await expectCounter(`1 / ${total}`);
    await page.keyboard.press('End');
    await expectCounter(`${total} / ${total}`);
    await verifyGeometry(`${route}: native last image`);
    await page.keyboard.press('Home');
    await expectCounter(`1 / ${total}`);
    await page.getByRole('button', {name:'Bild 2 anzeigen', exact:true}).click();
    await expectCounter(`2 / ${total}`);
    await page.keyboard.press('ArrowLeft');
    await expectCounter(`1 / ${total}`);
    await page.locator('.photo-stage > img').click();
    await page.keyboard.press('ArrowRight');
    await expectCounter(`2 / ${total}`);
    await page.keyboard.press('Control+ArrowLeft');
    await expectCounter(`2 / ${total}`);
    await page.getByRole('button', {name:'Erstes Bild (Home)', exact:true}).click();
    await expectCounter(`1 / ${total}`);
    await page.getByRole('button', {name:'Nächstes Bild (Pfeiltaste rechts)', exact:true}).click();
    await expectCounter(`2 / ${total}`);
    await page.getByRole('button', {name:'Vorheriges Bild (Pfeiltaste links)', exact:true}).click();
    await expectCounter(`1 / ${total}`);
    await page.getByRole('button', {name:'Letztes Bild (Ende)', exact:true}).click();
    await expectCounter(`${total} / ${total}`);
    if (total === 91) {
      await page.keyboard.press('End');
      await expectCounter('91 / 91');
      await page.screenshot({path:'output/playwright/gallery-edge-desktop.png'});
    }
    await page.getByRole('button', {name:/Vollbild schliessen:/}).click();
    await page.waitForFunction(() => !document.fullscreenElement);
    const selectedBefore = await counter();
    await page.locator('body').click({position:{x:2,y:2}});
    await page.keyboard.press('ArrowLeft');
    check(await counter() === selectedBefore, `${route}: outside gallery keys ignored`);
    await page.locator('.photo-stage > img').click();
    await page.keyboard.press('Home');
    await expectCounter(`1 / ${total}`);
    await page.keyboard.press('ArrowRight');
    await expectCounter(`2 / ${total}`);
    await page.setViewportSize({width:390, height:844});
    await page.locator('.photo-gallery-fullscreen').evaluate(el => Object.defineProperty(el, 'requestFullscreen', {value:undefined, configurable:true}));
    await page.getByRole('button', {name:/Vollbild öffnen:/}).click();
    await page.waitForFunction(() => !!document.querySelector('.photo-gallery-fullscreen.is-expanded'));
    await page.keyboard.press('End');
    await expectCounter(`${total} / ${total}`);
    await verifyGeometry(`${route}: mobile fallback last image`);
    await page.setViewportSize({width:844, height:390});
    await verifyGeometry(`${route}: landscape resize keeps last preview visible`);
    await page.setViewportSize({width:390, height:844});
    await verifyGeometry(`${route}: portrait resize keeps last preview visible`);
    await page.keyboard.press('Home');
    await expectCounter(`1 / ${total}`);
    await verifyGeometry(`${route}: mobile fallback first image`);
    await page.getByRole('button', {name:'Letztes Bild (Ende)', exact:true}).click();
    await expectCounter(`${total} / ${total}`);
    await page.getByRole('button', {name:'Erstes Bild (Home)', exact:true}).click();
    await expectCounter(`1 / ${total}`);
    if (total === 91) await page.screenshot({path:'output/playwright/gallery-edge-mobile.png'});
    await page.keyboard.press('Escape');
    check(await page.locator('.photo-gallery-fullscreen.is-expanded').count() === 0, `${route}: fallback Escape closes`);
    check(await page.evaluate(() => document.body.style.overflow !== 'hidden'), `${route}: body scrolling restored`);
  }
  return {browser:await page.evaluate(() => navigator.userAgent), checks:results.length};
}
