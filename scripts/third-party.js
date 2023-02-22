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

// eslint-disable-next-line import/no-cycle
import { getMetadata } from './scripts.js';
import { setObject } from './set-object.min.js';

const SCRIPT_TYPE_PARTYTOWN = 'text/partytown';

function getExperiment() {
    let experiment;
    if (window.hlx.experiment) {
        experiment = {
            id: window.hlx.experiment.id,
            variant: window.hlx.experiment.selectedVariant,
        };
    }
    return experiment;
}

async function instrumentMetadata() {
    if (!window.digitalData) {
        return;
    }
    const resp = await fetch('/blog/instrumentation.json');
    const json = await resp.json();
    const digitalDataMap = json.digitaldata.data;
    digitalDataMap.forEach((mapping) => {
        const metaValue = getMetadata(mapping.metadata);
        if (metaValue) {
            setObject(window.digitalData, mapping.digitaldata, metaValue);
        }
    });

    /*
    const digitalDataLists = json['digitaldata-lists'].data;
    digitalDataLists.forEach((listEntry) => {
      const metaValue = getMetadata(listEntry.metadata);
      if (metaValue) {
        // eslint-disable-next-line no-underscore-dangle
        let listValue = digitaldata._get(listEntry.digitaldata) || '';
        const name = listEntry['list-item-name'];
        const metaValueArr = listEntry.delimiter
          ? metaValue.split(listEntry.delimiter)
          : [metaValue];
        metaValueArr.forEach((value) => {
          const escapedValue = value.split('|').join(); // well, well...
          listValue += `${listValue ? ' | ' : ''}${name}: ${escapedValue}`;
        });
        // eslint-disable-next-line no-underscore-dangle
        digitaldata._set(listEntry.digitaldata, listValue);
      }
    */
}

function getAdobeTagsSrc() {
    /**
     * Adobe Tags
     *
     * To set a Development Environment, from your browser's Developer Tools' Console run
     *   localStorage.setItem('Adobe Tags Development Environment', '#')
     * (where # is 1, 2, 3, 4, or 5) and reload the page.
     *
     * To remove the Development Environment, from your browser's Developer Tools' Console run
     *   localStorage.removeItem('Adobe Tags Development Environment')
     * and reload the page.
     */
    let adobeTagsSrc = 'https://assets.adobedtm.com/ae3ff78e29a2/7f43f668d8a7/launch-';
    // let adobeTagsSrc = 'http://localhost:8010/proxy/ae3ff78e29a2/7f43f668d8a7/launch-';
    const adobeTagsDevEnvNumber = (localStorage ? localStorage.getItem('Adobe Tags Development Environment') : undefined);
    const adobeTagsDevEnvURLList = {
        1: 'f8d48fe68c86-development.min.js',
        2: 'c043b6e2b351-development.min.js',
        3: 'ede0a048d603-development.min.js',
        4: '7565e018a7a2-development.min.js',
        5: '30e70f4281a7-development.min.js'
    };
    const adobeTagsDevEnv = adobeTagsDevEnvURLList[adobeTagsDevEnvNumber];

    if (adobeTagsDevEnv) {
        adobeTagsSrc += adobeTagsDevEnv;
    } else {
        const isProdSite = /^(marketplace|partners|www)\.bamboohr\.com$/i.test(document.location.hostname);
        adobeTagsSrc += (isProdSite ? '58a206bf11f0.min.js' : '9e4820bf112c-staging.min.js');
    }
    return adobeTagsSrc;
}

const createScriptElement = (element, src, type, attributes = {}) => {
    const script = document.createElement('script');
    script.src = src;
    if (type) {
        script.type = type;
    }
    element.appendChild(script);

    Object.keys(attributes).forEach((key) => {
        script.setAttribute(key, attributes[key]);
    });

    return script;
};

const configure = () => {
    window.getExperiment = () => getExperiment();
    window.instrumentMetadata = () => instrumentMetadata();
};

/**
 * Initializes partytown and creates the necessary script tags for martech tracking.
 * The partytown library is added to the <head> and partytown configured to offload
 * the relevant scripts.
 */
// eslint-disable-next-line import/prefer-default-export
export function offloadMartech() {
    configure();
    createScriptElement(document.body, 'https://assets.adobedtm.com/51b39232f128/4ef69ac41bda/launch-4fd85596a4b5-development.js', SCRIPT_TYPE_PARTYTOWN);
    createScriptElement(document.body, '/scripts/offload-run.js', SCRIPT_TYPE_PARTYTOWN);

    window.partytown = {
        logCalls: true,
        logGetters: true,
        logSetters: true,
        logStackTraces: false,
        logScriptExecution: true,
        debug: true,
        lib: '/scripts/',
        mainWindowAccessors: ['instrumentMetadata', 'getExperiment'],
        globalFns: ['s_gi', 'AppMeasurement', 's', '_satellite'],
        // globalFns: ['s_gi', 'AppMeasurement', 's', '_satellite',
        // 'aaPlugins', 'bhr', '_wq', 'getTimeParting',
        // 'digitalData', adobeDataLayer'],
        forward: ['adobeDataLayer.push', 'digitalData.push', '_satellite.setVar', '_satellite.getVar', '_satellite.track'],
        // eslint-disable-next-line
        resolveUrl: function (url, location, type) {
            if (type === 'script' && !url.pathname.startsWith('/scripts')) {
                const proxyUrl = new URL(url);
                proxyUrl.hostname = 'analytics-proxy.test';
                proxyUrl.port = url.href.startsWith("https") ? 4443 : 8080;
                return proxyUrl;
            }
            return url;
        },
    };

    // general init of partytown
    import('./partytown.js');
}
