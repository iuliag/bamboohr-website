/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

const makeAbsoluteLinks = (main) => {
  main.querySelectorAll('a').forEach((a) => {
    if (a.href.startsWith('/')) {
      const ori = a.href;
      const u = new URL(a.href, 'https://www.bamboohr.com/');
      a.href = u.toString();

      if (a.textContent === ori) {
        a.textContent = a.href;
      }
    }
  });
};

const createTitleBlock = (main, document) => {
  main.querySelectorAll('h1').forEach((heading) => {
    const cells = [['Title (hero-header, title color shade 10)']];
    const titleContainer = document.createElement('div');
    const title = document.querySelector('h1');
    if (title) {
      const h = document.createElement('h1');
      h.innerHTML = title.innerHTML;
      titleContainer.append(h);
    }
    cells.push([titleContainer]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    heading.replaceWith(table);
  });
};

const createSubtitleBlock = (main, document) => {
  main.querySelectorAll('.ProductBanner__subTitle').forEach((heading) => {
    const cells = [['Title (hero-subhead)']];
    const titleContainer = document.createElement('div');
    const title = document.querySelector('.ProductBanner__subTitle');
    if (title) {
      const h = document.createElement('h2');
      h.innerHTML = title.innerHTML;
      titleContainer.append(h);
    }
    cells.push([titleContainer]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    heading.replaceWith(table);
  });
};

const createProductFeatureBlock = (main, document) => {
  main.querySelectorAll('.ProductFeature').forEach((featureBlock) => {
    const cells = [
      ['Columns (7/5, button color shade 5, button text color white, image round corners, image shadow, spacing, copy color gray 12, align center)'],
      [[],[]]
    ];
    console.log(cells);
    // const cellsBelow = [];

    featureBlock.querySelectorAll('.ProductFeatureBlock').forEach((block) => {
      const container = document.createElement('div');

      const image = block.querySelector('img');
      if (image) {
        container.append(image);
      }

      const heading = block.querySelector('h2');
      if (heading) {
        const h = document.createElement('h3');
        h.innerHTML = heading.innerHTML.replace(/[\r\n\t]/gm, '');
        container.append(h);
      }

      const description = block.querySelector('p');
      if (description) {
        const p = document.createElement('p');
        p.innerHTML = description.innerHTML.replace(/[\r\n\t]/gm, '');
        container.append(p);
      }

      const button = block.querySelector('a');
      if (button) {
        container.append(button);
      }

      // cells[1][0].push([container.innerHTML]);
      cells.push([container]);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    featureBlock.replaceWith(table);
  });
};

const createQuoteBlock = (main, document) => {
  main.querySelectorAll('.ProductCustomerContainer').forEach((quote) => {
    const cells = [['Quote (full, spacing)']];
    const container = document.createElement('div');

    const quoteText = document.querySelector('.ProductCustomer__quote');
    if (quoteText) {
      const q = document.createElement('p');
      q.innerHTML = quoteText.innerHTML;
      container.append(q);
    }

    const quoteInfo = document.querySelector('.ProductCustomer__name');
    if (quoteInfo) {
      const i = document.createElement('p');
      i.innerHTML = quoteInfo.innerHTML;
      container.append(i);
    }

    cells.push([container]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    quote.replaceWith(table);
  });
};

const createCallToActionBlock = (main, document) => {
  main.querySelectorAll('.ProductFeature').forEach((block) => {
    block.querySelectorAll('.ProductReviewCta').forEach((cta) => {

      const cells = [['Title (section-header, title color shade 10)']];

      const container = document.createElement('div');

      const firstText = cta.querySelector('div.typ-section-header');
      if (firstText) {
        const h = document.createElement('h2');
        h.innerHTML = firstText.textContent;
        container.append(h);
      }

      const sub = cta.querySelector('.ProductReviewCta__desc');
      if (sub) {
        const p = document.createElement('p');
        p.innerHTML = sub.innerHTML.replace(/[\r\n\t]/gm, '');
        container.append(p);
      }

      cells.push([container]);

      const button = cta.querySelector('.ProductFeatureBlock__button');
      if (button) {
        cells.push([button]);
      }
      const table = WebImporter.DOMUtils.createTable(cells, document);
      cta.replaceWith(table);
    });
  });
};

const createTestimonialHeaderBlock = (main, document) => {
  main.querySelectorAll('.ProductTestimonial__header').forEach((header) => {
    const cells = [['Title']];
    const container = document.createElement('div');
    const firstText = header.querySelector('h3.typ-section-header');

    if (firstText) {
      const h = document.createElement('h3');
      h.innerHTML = firstText.textContent;
      container.append(h);
    }

    const sub = header.querySelector('div.typ-section-subhead');
    if (sub) {
      const p = document.createElement('p');
      p.innerHTML = sub.innerHTML.replace(/[\r\n\t]/gm, '');
      container.append(p);
    }

    cells.push([container]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    header.replaceWith(table);
  });
};

const createTestimonialBlock = (main, document) => {
  main.querySelectorAll('.ProductTestimonial').forEach((testimonial) => {
    const cells = [['Columns (7/5, testimonial, spacing, copy color gray 12)']];
    const container = document.createElement('div');
    const firstText = testimonial.querySelector('.ProductTestimonialVideo__quote');

    const wistiaLink = testimonial.querySelector('.ProductTestimonialVideo__left:first-child');
    if (wistiaLink) {
      const link = wistiaLink.getAttribute('src');
      container.append(link);
    }

    if (firstText) {
      const p = document.createElement('p');
      p.innerHTML = firstText.textContent;
      container.append(p);
    }

    const secondText = testimonial.querySelector('.ProductTestimonialVideo__reference');
    if (secondText) {
      const p = document.createElement('p');
      p.innerHTML = secondText.innerHTML.replace(/[\r\n\t]/gm, '');
      container.append(p);
    }

    cells.push([container]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    testimonial.replaceWith(table);
  });
};

const createReferenceBlock = (main, document) => {
  main.querySelectorAll('.ProductMoreRow').forEach((container) => {

    const cells = [['Cards (dual-tone, icon 60, 3 columns, copy color gray 12, spacing)']];

    container.querySelectorAll('.ProductMoreRowBlock').forEach((reference) => {
      const wrapper = document.createElement('div');

      const image = reference.querySelector('.ProductMoreRowBlock__image');
      if (image) {
        wrapper.append(image);
      }

      const description = reference.querySelector('.ProductMoreRowBlock__copy');
      if (description) {
        const p = document.createElement('p');
        p.innerHTML = description.innerHTML.replace(/[\r\n\t]/gm, '');
        wrapper.append(p);
      }

      const button = reference.querySelector('a');
      if (button) {
        wrapper.append(button);
      }

      cells.push([wrapper]);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    container.replaceWith(table);
  });
};

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const description = document.querySelector('[property="og:description"]');
  if (description) {
    meta.Description = description.content.replace(/[\r\n\t]/gm, '');
  }

  const img = document.querySelector('[property="og:image"]');
  if (img) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
  }

  const term = document.querySelector('h1');
  if (term) {
    meta.Term = term.innerHTML.replace(/[\n\t]/gm, '');
  }

  meta.Template = 'HR Software';
  meta.Theme = 'green';

  meta.Category = '';

  meta.Robots = '';

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(document.body, [
      'header',
      'footer',
      '.NavbarMobile',
      '.acc-out-of-view',
      '.Footer',
    ]);
    const main = document.querySelector('.Product');
    createCallToActionBlock(main, document);
    createTitleBlock(main, document);
    createSubtitleBlock(main, document);
    createQuoteBlock(main, document);
    createReferenceBlock(main, document);
    createTestimonialHeaderBlock(main, document);
    createTestimonialBlock(main, document);
    createProductFeatureBlock(main, document);
    makeAbsoluteLinks(main);
    createMetadata(main, document);
    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @return {string} The path
   */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
};
