import {
  lookupPages,
  getMetadata,
  createOptimizedPicture,
  fetchPlaceholders,
  loadCSS,
  readBlockConfig,
  readIndex,
  toCamelCase,
  toCategory,
  toClassName,
} from '../../scripts/scripts.js';
import { createAppCard, sortOptions } from '../app-cards/app-cards.js';
import decorateWistia from '../wistia/wistia.js';

let gLoadWistiaCSS = true;

function getLinkText(format, mediaType) {
  let linkText = 'Read Now';
  if (format) linkText = format.toLowerCase() === 'video' ? 'Watch Now' : 'Read Now';
  else if (mediaType) {
    switch (mediaType.toLowerCase()) {
      case 'watch':
        linkText = 'Watch Now';
        break;
      case 'listen':
        linkText = 'Listen Now';
        break;
      case 'read':
      case 'tools':
      default:
        linkText = 'Read Now';
        break;
    }
  }

  return linkText;
}

export function createArticleCard(article, classPrefix, customLinkText = '', eager = false) {
  const title = article.title.split(' | ')[0];
  const card = document.createElement('div');
  const productCategory = (article.planType && article.productArea) ? `${article.planType} | ${article.productArea}` : '';
  const articleCategory = article.category || article.topic || productCategory
    || article.contentType || article.brandedContent || '';
  const articleFormat = article?.format || article?.mediaType || '';
  card.className = `${classPrefix}-card`;
  card.setAttribute('am-region', `${articleCategory} . ${articleFormat}`.toUpperCase());
  let articlePicture = '';
  let wistiaBlock = '';
  if (article.wistiaVideoId) {
    wistiaBlock = `<div class="wistia block">
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
  const category = toCategory(articleCategory);
  const linkText = customLinkText || getLinkText(article?.format, article?.mediaType);

  const isProductUpdates = window.location.pathname.includes('/product-updates/');
  let releaseDate = '';
  if (isProductUpdates && article.publicationDate) {
    const [year, month, day] = article.publicationDate.split('-');
    releaseDate = `<div class="typ-small-info">Date of release: ${month}/${day}/${year}</div>`;
  } 
  

  const articleFormatSpan = articleFormat ? `<span class="${classPrefix}-card-format">${articleFormat}</span>` : '';

  card.innerHTML = `<div class="${classPrefix}-card-header category-color-${category}">
    <span class="${classPrefix}-card-category">${articleCategory}</span> 
    ${articleFormatSpan}
    </div>
    ${articleImage}
    <div class="${classPrefix}-card-body" am-region="${title}">
    <h5>${article?.presenter || ''}</h5>
    <h3>${title}</h3>
    ${releaseDate}
    <p>${article.description}</p>
    <p><a href="${article.path}">${linkText}</a></p>
    </div>`;
  return (card);
}

export function loadWistiaBlock(article, articleCard) {
  if (article.wistiaVideoId) {
    const wistiaBlock = articleCard.querySelector('.wistia.block');

    if (wistiaBlock) {
      decorateWistia(wistiaBlock);

      if (gLoadWistiaCSS) {
        // load css
        const cssBase = `${window.hlx.serverPath}${window.hlx.codeBasePath}`;
        loadCSS(`${cssBase}/blocks/wistia/wistia.css`, null);
        gLoadWistiaCSS = false;
      }
    }
  }
}

function getBlockHTML(ph, theme, indexConfig = {}) {
  let defaultSortText = ph.default;
  let defaultSortProp = 'level';
  let pageSortOptions = `<li data-sort="level">${ph.default}</li>
    <li data-sort="name">${ph.name}</li>
    <li data-sort="publicationDate">${ph.newest}</li>`;
  if (theme === 'hrvs') {
    defaultSortText = ph.category;
    defaultSortProp = 'hrvsCategory';
    pageSortOptions = `<li data-sort="hrvsCategory">${ph.category}</li>
      <li data-sort="startTime">${ph.startTime}</li>
      <li data-sort="presenter">${ph.presenter}</li>
      <li data-sort="title">${ph.title}</li>`;
  } else if (indexConfig.facetStyle === 'taxonomyV1') {
    defaultSortText = ph.newest;
    defaultSortProp = 'publicationDate';
    pageSortOptions = `<li data-sort="publicationDate">${ph.newest}</li>
      <li data-sort="title">${ph.title}</li>`;
  }
  return /* html */ `
  <p class="listing-results-count"><span id="listing-results-count"></span> ${ph.results}</p>
  <div class="listing-facets">
  </div>
  <div class="listing-search"><input id="fulltext" placeholder="${ph.typeToSearch}" /></div>
  <div class="listing-sortby">
    <div class="listing-filter-button">${ph.filter}</div>
    <p class="listing-sort-button">${ph.sortBy} <span data-sort="${defaultSortProp}" id="listing-sortby">${defaultSortText}</span></p>
    <ul>
      ${pageSortOptions}
    </ul>
  </div>
  <ul class="listing-results">
  </ul>`;
}

function getFacetHTML(ph, horizFilters) {
  const filterOptions = horizFilters ? 
      `<div class="listing-filters-facetlist"></div>
      <div class="listing-filters-selected never-show"></div>
      <p><button class="listing-filters-clear secondary">${ph.clearAll}</button></p>`
    : 
      `<div class="listing-filters-selected"></div>
      <p><button class="listing-filters-clear secondary">${ph.clearAll}</button></p>
      <div class="listing-filters-facetlist"></div>`;
  return /* html */ `
  <div><div class="listing-filters">
    ${filterOptions}
    </div>
    <div class="listing-apply-filters">
      <button>${ph.seeResults}</button>
  </div></div>`;
}

export async function filterResults(theme, config, facets = {}, indexConfig = {}) {
  /* load index */
  let collection = 'blog';
  if (theme === 'integrations') collection = 'integrations';
  else if (theme === 'hrvs') collection = 'hrvs';
  if (indexConfig.indexPath && indexConfig.indexName) {
    collection = indexConfig.indexName;
    await readIndex(indexConfig.indexPath, collection);
  } else {
    await lookupPages([], collection);
  }
  
  const listings = window.pageIndex[collection];

  /* simple array lookup */
  if (Array.isArray(config)) {
    const pathnames = config;
    return pathnames.map((path) => listings.lookup[path]).filter((e) => e);
  }

  /* setup config */
  const facetKeys = Object.keys(facets);
  const keys = Object.keys(config);
  const tokens = {};
  keys.forEach((key) => {
    tokens[key] = config[key].split(',').map((t) => t.trim());
  });

  /* filter */
  const results = listings.data.filter((row) => {
    const filterMatches = {};
    let matchedAll = keys.every((key) => {
      let matched = false;
      if (row[key]) {
        const rowValues = row[key].split(',').map((t) => t.trim());
        matched = tokens[key].some((t) => rowValues.includes(t));
      }
      if (key === 'fulltext') {
        const {fulltext} = config;
        matched = row.title.toLowerCase().includes(fulltext.toLowerCase()) || row.description.toLowerCase().includes(fulltext.toLowerCase());
      }
      filterMatches[key] = matched;
      return matched;
    });

    const isListing = () => !!row.publisher;

    if (theme === 'integrations' && !isListing()) matchedAll = false;

    /* facets */
    facetKeys.forEach((facetKey) => {
      let includeInFacet = true;
      Object.keys(filterMatches).forEach((filterKey) => {
        if (filterKey !== facetKey && !filterMatches[filterKey]) {
          includeInFacet = false;

          if (filterKey !== facetKey) {
            keys.every((key) => {
              let matched = false;

              if (row[key]) {
                const rowValues = row[key].split(',').map((t) => t.trim());
                matched = tokens[key].some((t) => rowValues.includes(t));

                if (matched) {
                  includeInFacet = true;
                }
                includeInFacet = false;
              }

              return matched;
            });
          }
        }
      });

      if (includeInFacet) {
        if (row[facetKey]) {
          const rowValues = row[facetKey].split(',').map((t) => t.trim());
          rowValues.forEach((val) => {
            if (facets[facetKey][val]) {
              facets[facetKey][val] += 1;
            } else {
              facets[facetKey][val] = 1;
            }
          });
        }
      }
    });
    return matchedAll;
  });
  return results;
}

export default async function decorate(block, blockName) {
  const horizFilters = block.classList.contains('horizontal-filters');
  const middleCta = block.classList.contains('middle-cta');
  const indexStyle = block.classList.contains('index-style');
  const themeOverrides = [...block.classList].filter((filter) => filter.startsWith('theme-'));
  const firstHyphenIdx = themeOverrides[0] ? themeOverrides[0].indexOf('-') + 1 : 0;
  const themeOverride = themeOverrides[0] ? themeOverrides[0].substring(firstHyphenIdx) : '';
  const theme = themeOverride || getMetadata('theme');
  const ph = await fetchPlaceholders('/integrations');
  const indexConfig = {indexPath: '', indexName: '', cardStyle: '', facetStyle: '', customLinkText: '', excludeSearch: ''};

  let excludeSearch = '';

  const addEventListeners = (elements, event, callback) => {
    elements.forEach((e) => {
      e.addEventListener(event, callback);
    });
  };

  const blockConfig = middleCta ? {} : readBlockConfig(block);

  /* camelCase config */
  const config = {};
  if (indexStyle) {
    indexConfig.indexPath = blockConfig['index-path'];
    indexConfig.indexName = blockConfig['index-name'];
    indexConfig.cardStyle = blockConfig['card-style'];
    indexConfig.facetStyle = blockConfig['facet-style'] || 'taxonomyV1';
    indexConfig.customLinkText = blockConfig['custom-link-text'];
    indexConfig.excludeSearch = blockConfig['exclude-search'];
    excludeSearch = indexConfig.excludeSearch;
  } else {
    excludeSearch = 'yes';
    Object.keys(blockConfig).forEach((key) => {
      config[toCamelCase(key)] = blockConfig[key];
    });
  }

  let ctaBlockInfo = null;
  if (middleCta) {
    ctaBlockInfo = document.createElement('div');
    ctaBlockInfo.append(block.firstElementChild);
  }
  block.innerHTML = getBlockHTML(ph, theme, indexConfig);

  const resultsElement = block.querySelector('.listing-results');
  const facetsElement = block.querySelector('.listing-facets');
  block.querySelector('.listing-filter-button').addEventListener('click', () => {
    block.querySelector('.listing-facets').classList.toggle('visible');
  });

  addEventListeners(
    [block.querySelector('.listing-sort-button'), block.querySelector('.listing-sortby p')],
    'click',
    () => {
      block.querySelector('.listing-sortby ul').classList.toggle('visible');
    },
  );

  const getSelectedFilters = () => [...block.querySelectorAll('input[type="checkbox"]:checked')];

  const hrvsCategoryGroups = [];

  const getHRVSVisibleCount = () => {
    const currentSelected = getSelectedFilters();
    return hrvsCategoryGroups.reduce((cnt, g) => {
      const isSelected = currentSelected.find(checked => checked.value === g.category);
      return (!currentSelected.length || isSelected) ? cnt + g.visibleCnt : cnt;
    }, 0);
  };

  let listingGroupsElem = null;
  let listingMiddleCtaElem = null;
  let currentHRVSSelected = null;
  const displayHRVSResults = async (results) => {
    if (listingGroupsElem) {
      // Nth time through initialization. Doesn't need to be done first time.
      if (listingMiddleCtaElem) {
        ctaBlockInfo.append(listingMiddleCtaElem);
        listingMiddleCtaElem = null;
      }
      
      listingGroupsElem.innerHTML = '';
      hrvsCategoryGroups.forEach(g => {
        g.catGroupElem = null;
        g.catGroupResultsElm = null;
      });
      currentHRVSSelected = getSelectedFilters();
    }
    results.forEach((product) => {
      if (!listingGroupsElem) {
        // Create listing-groups element
        listingGroupsElem = document.createElement('div');
        listingGroupsElem.className = 'listing-groups';

        resultsElement.parentElement.append(listingGroupsElem);
      }

      let group = hrvsCategoryGroups.find(g => g.category === product.category);
      let groupElem = group?.catGroupElem;
      let groupResultsElem = group?.catGroupResultsElm;

      if (!groupElem) {
        // Create group element
        groupElem = document.createElement('div');
        groupElem.className = 'listing-group';
        if (currentHRVSSelected?.length > 0) {
          // Nth time through need to keep filter state
          const isSelected = currentHRVSSelected.find(checked => checked.value === group.category);
          if (!isSelected) groupElem.classList.add('listing-group-hidden');
        }
        listingGroupsElem.append(groupElem);

        // Create group label
        const span = document.createElement('span');
        span.className = 'listing-group-label';
        span.textContent = product.category;
        groupElem.append(span);

        // Create/re-use listing-results element
        if (!hrvsCategoryGroups.length) {
          // First time through we repurpose existing resultsElement
          groupResultsElem = resultsElement;
        } else {
          groupResultsElem = document.createElement('ul');
          groupResultsElem.className = 'listing-results';
        }
        groupElem.append(groupResultsElem);

        // Group state
        if (group === undefined) {
          // Group initialization
          group = {category: product.category, catGroupElem: groupElem,
            catGroupResultsElm: groupResultsElem, visibleCnt: 0, max: 10, limit: true,
            addShowMore: true};
          
          hrvsCategoryGroups.push(group);
        } else {
          // Group update
          group.catGroupElem = groupElem;
          group.catGroupResultsElm = groupResultsElem;
          group.visibleCnt = 0;
          group.addShowMore = true;
        }

        if (ctaBlockInfo) {
          const groupCnt = hrvsCategoryGroups.reduce((cnt, g) => g.catGroupElem ? cnt + 1 : cnt, 0);
  
          if (groupCnt === 2 && !listingMiddleCtaElem) {
            listingMiddleCtaElem = ctaBlockInfo.firstElementChild;
            const cols = [...listingMiddleCtaElem.children];
            listingMiddleCtaElem.classList.add('listing-middle-cta', `columns-${cols.length}-cols`);

            cols.forEach(col => {
              if (col.querySelector('img')) col.classList.add('middle-cta-column5', 'img-col');
              else col.classList.add('middle-cta-column7', 'non-img-col');

              const buttons = col.querySelectorAll('a.button');
              buttons.forEach((button) => button.classList.add('small'));
            });
  
            listingGroupsElem.append(listingMiddleCtaElem);
          }
        }
      }

      if (!group.limit || group.visibleCnt < group.max) {
        // Add card
        group.visibleCnt += 1;
        groupResultsElem.append(createArticleCard(product, 'hrvs'));
      } else if (group.addShowMore) {
        // Add show more.
        group.addShowMore = false;

        // Create the load more element and add it to the groupElem
        const wrapper = document.createElement('div');
        wrapper.className = 'load-more-wrapper';
        const loadMore = document.createElement('a');
        loadMore.className = 'load-more';
        loadMore.href = '#';
        loadMore.textContent = 'Load More';
        wrapper.append(loadMore);
        groupElem.append(wrapper);

        loadMore.addEventListener('click', (event) => {
          event.preventDefault();
          loadMore.remove();
          group.limit = false;
          
          const listings = window.pageIndex.hrvs;
          const loadMoreGroupResults = listings.data.filter(row => row.category === group.category);
          loadMoreGroupResults.sort(sortOptions('hrvsCategory'));

          for (let i = group.max; i < loadMoreGroupResults.length; i += 1) {
            group.visibleCnt += 1;
            groupResultsElem.append(createArticleCard(loadMoreGroupResults[i], 'hrvs'));
          }

          // Update results count
          block.querySelector('#listing-results-count').textContent = getHRVSVisibleCount();
        });
      }
    });

    // Update results count
    block.querySelector('#listing-results-count').textContent = getHRVSVisibleCount();
  };

  const highlightResults = (res) => {
    const fulltext = document.getElementById('fulltext').value;
    if (fulltext) {
      res.querySelectorAll('h4 a').forEach((title) => {
        const content = title.textContent;
        const offset = content.toLowerCase().indexOf(fulltext.toLowerCase());
        if (offset >= 0) {
          title.innerHTML = `${content.substr(0, offset)}<span class="highlight">${content.substr(offset, fulltext.length)}</span>${content.substr(offset + fulltext.length)}`;
        }
      });
    }
  };

  const displayResults = async (results) => {
    if (theme === 'hrvs') displayHRVSResults(results);
    else {
      resultsElement.innerHTML = '';
      results.forEach((product) => {
        if (indexConfig.cardStyle === 'article') {
          const articleCard = createArticleCard(product, 'listing-article', indexConfig.customLinkText);
          resultsElement.append(articleCard);
          loadWistiaBlock(product, articleCard);
        } else resultsElement.append(createAppCard(product, blockName));
      });
      highlightResults(resultsElement);
    }

    window.setTimeout(() => {
      document.querySelectorAll('.listing-card-header h4').forEach(h4 => {
        if (h4.scrollWidth > h4.clientWidth) h4.title = h4.innerText;
      });
    }, 1000);
  };

  const runSearch = async (filterConfig = config) => {
    let facets = {};
    if (indexConfig.facetStyle === 'taxonomyV1') {
      facets = {
        topic: {},
        planType: {},
        productArea: {},
        contentType: {},
        brandedContent: {},
        mediaType: {},
        authorSpeaker: {},
        contentSize: {},
        industry: {},
        companySize: {},
        companyGrowthStage: {},
        userRole: {},
      };
    } else {
      facets = {
        category: {},
        businessSize: {},
        dataFlow: {},
        industryServed: {},
        locationRestrictions: {},
      };
    }
    
    const results = await filterResults(theme, filterConfig, facets, indexConfig);
    // eslint-disable-next-line no-nested-ternary
    const sortBy = document.getElementById('listing-sortby')
      ? document.getElementById('listing-sortby').dataset.sort
      : (theme === 'hrvs') ? 'hrvsCategory' : 'level';

    if (sortBy && sortOptions(sortBy)) results.sort(sortOptions(sortBy));
    block.querySelector('#listing-results-count').textContent = results.length;
    displayResults(results, null);
    // eslint-disable-next-line no-use-before-define
    displayFacets(facets, filterConfig, results.length);
  };

  const createFilterConfig = () => {
    const filterConfig = { ...config };
    getSelectedFilters().forEach((checked) => {
      const facetKey = checked.name;
      const facetValue = checked.value;
      if (filterConfig[facetKey]) filterConfig[facetKey] += `, ${facetValue}`;
      else filterConfig[facetKey] = facetValue;
    });
    filterConfig.fulltext = document.getElementById('fulltext').value;
    return filterConfig;
  };

  const sortList = block.querySelector('.listing-sortby ul');
  const selectSort = (selected) => {
    [...sortList.children].forEach((li) => li.classList.remove('selected'));
    selected.classList.add('selected');
    const sortBy = document.getElementById('listing-sortby');
    sortBy.textContent = selected.textContent;
    sortBy.dataset.sort = selected.dataset.sort;
    document.getElementById('listing-sortby').textContent = selected.textContent;
    block.querySelector('.listing-sortby ul').classList.remove('visible');
    runSearch(createFilterConfig());
  };

  sortList.addEventListener('click', (event) => {
    selectSort(event.target);
  });

  const displayFacets = (facets, filters, resultsCount) => {
    const rawFilters = getSelectedFilters().map((check) => check.value);
    const selected = config.category
      ? rawFilters.filter((filter) => filter !== config.category)
      : rawFilters;
    facetsElement.innerHTML = getFacetHTML(ph, horizFilters);

    addEventListeners(
      [
        facetsElement.querySelector('.listing-apply-filters button'),
        facetsElement.querySelector(':scope > div'),
        facetsElement,
      ],
      'click',
      (event) => {
        if (event.currentTarget === event.target) {
          block.querySelector('.listing-facets').classList.remove('visible');
        }
      },
    );

    const selectedFilters = block.querySelector('.listing-filters-selected');
    selected.forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'listing-filters-tag';
      span.textContent = tag;
      span.addEventListener('click', () => {
        document.getElementById(`listing-filter-${tag}`).checked = false;
        const filterConfig = createFilterConfig();

        runSearch(filterConfig);
      });
      selectedFilters?.append(span);
    });

    facetsElement.querySelector('.listing-filters-clear').addEventListener('click', () => {
      if (theme === 'hrvs') {
        getSelectedFilters().forEach(f => {
          if (f.checked) f.parentElement.classList.remove('selected');
          f.checked = false;
        });

        // Show groups
        hrvsCategoryGroups.forEach(g => {
          if (g.catGroupElem?.classList.contains('listing-group-hidden')) {
            g.catGroupElem.classList.remove('listing-group-hidden');
          }
        });

        // Show middle cta
        listingMiddleCtaElem?.classList.remove('listing-group-hidden');

        // Hide clear all
        selectedFilters.classList.add('never-show');

        // Update results count
        block.querySelector('#listing-results-count').textContent = getHRVSVisibleCount();
      } else {
        selected.forEach((tag) => {
          document.getElementById(`listing-filter-${tag}`).checked = false;
        });

        const filterConfig = createFilterConfig();

        runSearch(filterConfig);
      }
    });

    /* list facets */
    const facetsList = block.querySelector('.listing-filters-facetlist');
    const facetKeys = Object.keys(facets);
    facetKeys.forEach((facetKey) => {
      const filter = filters[facetKey];
      const filterValues = filter ? filter.split(',').map((t) => t.trim()) : [];
      const facetValues = Object.keys(facets[facetKey]);
      if (theme === 'hrvs' && facetKey === 'category') {
        // eslint-disable-next-line no-nested-ternary
        facetValues.sort((a, b) => a.toLowerCase() === 'keynote' ? -1
                                    : b.toLowerCase() === 'keynote' ? 1
                                    : a.localeCompare(b));
      } else facetValues.sort();
      if (facetValues.length 
          && (facetValues.length !== 1 
              || filterValues.includes(facetValues[0]) 
              || facets[facetKey][facetValues[0]] < resultsCount)) {
        const div = document.createElement('div');
        div.className = 'listing-facet';
        const h3 = document.createElement('h3');
        h3.innerHTML = ph[facetKey];
        div.append(h3);
        facetValues.forEach((facetValue) => {
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.value = facetValue;
          input.checked = filterValues.includes(facetValue);
          input.id = `listing-filter-${facetValue}`;
          input.name = facetKey;
          const label = document.createElement('label');
          label.setAttribute('for', input.id);
          label.textContent = `${facetValue} (${facets[facetKey][facetValue]})`;
          if (theme === 'hrvs' && facetKey === 'category') {
            const iconDiv = document.createElement('div');
            iconDiv.classList.add(`${toClassName(facetValue)}-icon`, 'category-icon');
            iconDiv.append(input, label);
            div.append(iconDiv);

            iconDiv.addEventListener('click', (event) => {
              // Don't fire for the label
              if (event.target.tagName === 'LABEL') return;
              // If caused by parent div, toggle the input.
              if (event.target.tagName !== 'INPUT') input.checked = !input.checked;

              if (input.checked) input.parentElement.classList.add('selected');
              else input.parentElement.classList.remove('selected');

              const currentSelected = getSelectedFilters();

              // Show/hide groups based on current filter state
              hrvsCategoryGroups.forEach(g => {
                const isSelected = currentSelected.find(checked => checked.value === g.category);
                if (!currentSelected.length || isSelected) {
                  if (g.catGroupElem?.classList.contains('listing-group-hidden')) {
                    g.catGroupElem.classList.remove('listing-group-hidden');
                  }
                } else if (g.catGroupElem &&
                           !g.catGroupElem.classList.contains('listing-group-hidden')) {
                  g.catGroupElem.classList.add('listing-group-hidden');
                }
              });

              if (listingMiddleCtaElem) {
                if (!currentSelected.length || currentSelected.length >= 4) {
                  listingMiddleCtaElem.classList.remove('listing-group-hidden');
                } else if (!listingMiddleCtaElem.classList.contains('listing-group-hidden')) {
                  listingMiddleCtaElem.classList.add('listing-group-hidden');
                }
              }
              
              // Show/hide clear all
              if (currentSelected.length) selectedFilters.classList.remove('never-show');
              else selectedFilters.classList.add('never-show');

              // Update results count
              block.querySelector('#listing-results-count').textContent = getHRVSVisibleCount();
            });
          } else {
            div.append(input, label);

            input.addEventListener('change', () => {
              const filterConfig = createFilterConfig();

              runSearch(filterConfig);
            });
          }
        });
        facetsList.append(div);

        if (theme === 'hrvs') {
          // Update selected filter icons
          getSelectedFilters().forEach(f => {
            if (f.checked) f.parentElement.classList.add('selected');
          });
        }
      }
    });
  };

  // search box
  const fulltextElement = block.querySelector('#fulltext');
  fulltextElement.addEventListener('input', () => {
    runSearch(createFilterConfig());
  });
  
  if (excludeSearch && excludeSearch.toLowerCase() === 'yes') {
    fulltextElement.style.display = 'none';
  }

  runSearch(config);
}
