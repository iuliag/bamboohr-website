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

// const SCRIPT_TYPE_PARTYTOWN = 'text/partytown';

function getExperiment() {
    let experiment;
    if (window.hlx.experiment) {
        experiment = {
            experimentId: window.hlx.experiment.id,
            experimentVariant: window.hlx.experiment.selectedVariant,
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

/*
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
*/

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

    /*
    window.partytown = {
        logCalls: true,
        logGetters: true,
        logSetters: true,
        logStackTraces: false,
        logScriptExecution: true,
        mainWindowAccessors: ['getExperiment', 'instrumentMetadata'],
        debug: true,
        lib: '/scripts/',
    };

    // general init of partytown
    import('./partytown.js');

    createScriptElement(document.body, '/scripts/alloy-init.js', SCRIPT_TYPE_PARTYTOWN);
    createScriptElement(document.body, '/scripts/alloy.js', SCRIPT_TYPE_PARTYTOWN);
    createScriptElement(document.body,'/scripts/alloy-config.js', SCRIPT_TYPE_PARTYTOWN);
    // createScriptElement(document.body, '/scripts/offload-run.js', SCRIPT_TYPE_PARTYTOWN);
    */
}
