import { buildBlock, getMetadata } from './scripts.js';

function buildDisclaimer(main) {
  let helpGuide = 'https://help.bamboohr.com/hc/en-us';
  if (getMetadata('help-guide')) helpGuide = getMetadata('help-guide');
  const disclaimerEl = document.createElement('p');
  disclaimerEl.className = 'product-updates-disclaimer';
  disclaimerEl.innerHTML = `Please note: The information included in this release note is accurate as of the date it was released. For the most up-to-date information on this product feature, please refer to the corresponding <a href="${helpGuide}" aria-label="Click here to see our help guides - opens in a new window" target="_blank">help guides</a>. Must be logged into BambooHR to access help guides.`;
  main.prepend(disclaimerEl);
}

function buildIntroMeta() {
  let releaseDate = getMetadata('publication-date');
  const planType = getMetadata('plan-type');
  const productArea = getMetadata('product-area');
  const h1 = document.querySelector('h1');

  if (releaseDate && planType && productArea) {
    const [year, month, day] = releaseDate.split('-');
    releaseDate = `${month}/${day}/${year}`;

    const introMetaData = [];
    introMetaData.push(`<span class="intro-meta-cat">${planType} | ${productArea}</span><span class="intro-meta-date">Date of release: ${releaseDate}</span>`);
    const introMetaBlock = buildBlock('title', [introMetaData]);
    introMetaBlock?.classList?.add('medium-info', 'intro-meta');
    h1.after(introMetaBlock);
  }
}

function buildWistiaEmbed(main) {
  const wistiaVideoId = getMetadata('wistia-video-id');
  if (wistiaVideoId) {
    const wistiaVideoUrl = `https://bamboohr.wistia.com/medias/${wistiaVideoId}`;
    const wistiaData = [];
    wistiaData.push(`<p><a href="${wistiaVideoUrl}"></a></p>`);

    const wistiaBlock = buildBlock('wistia', [wistiaData]);
    const wistiaSection = document.createElement('div');
    wistiaSection.prepend(wistiaBlock);
    const introMetaEl = main.querySelector('.intro-meta');
    introMetaEl.after(wistiaSection);
  }
}

function buildBottomCta(main) {
  const bottomCta = [];
  bottomCta.push('<a class="button accent" href="/product-updates/" aira-label="Click here to return to all release notes">Return to All Release Notes</a>');

  const bottomCtaBlock = buildBlock('title', [bottomCta]);
  bottomCtaBlock.classList.add('color-white', 'bottom-cta');
  const ctaSection = document.createElement('div');
  ctaSection.classList.add('bottom-cta-container');
  ctaSection.prepend(bottomCtaBlock);
  main.append(ctaSection);
}

export default async function decorateTemplate(main) {
  buildDisclaimer(main);
  buildIntroMeta(main);
  buildWistiaEmbed(main);
  buildBottomCta(main)
}