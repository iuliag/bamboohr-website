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

function initDataLayer() {
    window.digitalData = {};
    window.digitalData.push = (obj) => {
        Object.assign(window.digitalData, window.digitalData, obj);
    };
}

function trackPageView() {
    const experiment = window.getExperiment();
    if (!window.digitalData) {
        return;
    }
    window.digitalData.push({
        event: 'Page View',
        page: {
            country: 'us',
            language: 'en',
            platform: 'web',
            site: 'blog'
        },
        ...(experiment ? { experiment }: {})
    });
}

// Call async
(async() => {
    console.debug('BEFORE TRACKING');
    initDataLayer();
    await window.instrumentMetadata();
    trackPageView();
    console.debug('AFTER TRACKING');
})();
