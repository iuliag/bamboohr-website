import {
  createOptimizedPicture,
  readBlockConfig,
  readIndex,
} from '../../scripts/scripts.js';
import { createAppCard, sortOptions } from '../app-cards/app-cards.js';
import { createArticleCard, loadWistiaBlock } from '../listing/listing.js';

function createDateCard(article, classPrefix, eager = false, cardLink = {}) {
  const title = article.title.split(' | ')[0];
  const card = document.createElement('div');
  const articleCategory = article.category || article.topic || article.contentType
    || article.brandedContent || '';
  const articleCategoryElement = articleCategory ? `<p>${articleCategory}</p>` : '';
  const articleFormat = article?.format || article?.mediaType || '';
  card.className = `${classPrefix}-card`;
  card.setAttribute('am-region', `${articleCategory} . ${articleFormat}`.toUpperCase());
  let articlePicture = '';
  let wistiaBlock = '';
  if (article.wistiaVideoId) {
    wistiaBlock = `<div class="wistia block hide-play">
        <a href="https://bamboohr.wistia.com/medias/${article.wistiaVideoId}"></a>
      </div>`;
  } else {
    const image = article.cardImage || article.image;
    const pictureString = createOptimizedPicture(
      image,
      article.imageAlt || article.title,
      eager,
      [{ width: 750 }],
    ).outerHTML;

    articlePicture = `<div class="${classPrefix}-card-picture">
        <a href="${article.path}">${pictureString}</a>
      </div>`;
  }
  const articleImage = articlePicture || wistiaBlock;
  const articleLinkText = cardLink.text || article.linkText || 'Register for this event';
  const articlePath = cardLink.link || article.path || '';

  const articleLink = articlePath ? `<p><a href="${articlePath}">${articleLinkText}</a></p>` : '';

  card.innerHTML = `
    ${articleImage}
    <div class="${classPrefix}-card-body" am-region="${title}">
    <h4>${article.eventDateAndTime}</h4>
    <h5>${article?.presenter || ''}</h5>
    <h3>${title}</h3>
    <p>${article.description}</p>
    ${articleCategoryElement}
    ${articleLink}
    </div>`;
  return (card);
}

function checkForMatch(row, key, defaultReturn) {
  if (key === 'futureOnly') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(row.eventDate);
    
    if (date >= today) return true;

    return false;
  }

  if (row[key]) {
    if (key !== 'eventDateAndTime') return true;
    if (!row[key].toLowerCase().includes('demand')) return true;
  }

  return defaultReturn;
}

async function filterResults(indexConfig = {}) {
  /* load index */
  const collection = indexConfig.indexName;
  await readIndex(indexConfig.indexPath, collection);
  
  const listings = window.pageIndex[collection];

  if (!indexConfig.filterOn) return listings.data;

  const keys = indexConfig.filterOn.split(',').map((t) => t.trim());

  /* filter */
  const results = listings.data.filter((row) => {
    let matched = false;
    const matchedAll = keys.every((key) => {
      matched = checkForMatch(row, key, matched);
      return matched;
    });

    return matchedAll;
  });
  
  return results;
}

export default async function decorate(block, blockName) {
  const indexConfig = {indexPath: '', indexName: '', cardStyle: '', filterOn: '', sortBy: ''};
  const blockConfig = readBlockConfig(block);

  indexConfig.indexPath = blockConfig['index-path'];
  indexConfig.indexName = blockConfig['index-name'];
  indexConfig.cardStyle = blockConfig['card-style'];
  indexConfig.filterOn = blockConfig.filter;
  indexConfig.sortBy = blockConfig['sort-by'];
  indexConfig.limit = +blockConfig.limit || 0;
  
  let cardLink = {};
  if (blockConfig['card-link'] && blockConfig['card-link-text']) {
    cardLink = {link: blockConfig['card-link'], text: blockConfig['card-link-text']};
  }

  block.innerHTML = '<ul class="upcoming-results"></ul>';

  const resultsElement = block.querySelector('.upcoming-results');

  const displayResults = async (results) => {
    resultsElement.innerHTML = '';
    const max = indexConfig.limit ? indexConfig.limit : results.length;
    for (let i = 0; i < max; i += 1) {
      const product = results[i];

      if (indexConfig.cardStyle === 'date') {
        const dateCard = createDateCard(product, 'upcoming-article', false, cardLink);
        resultsElement.append(dateCard);
        loadWistiaBlock(product, dateCard);
      } else if (indexConfig.cardStyle === 'article') {
        const articleCard = createArticleCard(product, 'upcoming-article');
        resultsElement.append(articleCard);
        loadWistiaBlock(product, articleCard);
      } else resultsElement.append(createAppCard(product, blockName));
    }
  };

  const runSearch = async () => {
    const results = await filterResults(indexConfig);
    const { sortBy } = indexConfig;

    if (sortBy && sortOptions(sortBy)) results.sort(sortOptions(sortBy));
    displayResults(results, null);
  };

  runSearch();
}
