const ALLOY_EDGE_CONFIG_ID = 'e485bc71-9189-47fd-8327-0593f1b0506b';
const ALLOY_ORG_ID = '908936ED5D35CC220A495CD4@AdobeOrg';

(async() => {
    await alloy('configure', {
        debugEnabled: true,
        clickCollectionEnabled: false,
        edgeConfigId: ALLOY_EDGE_CONFIG_ID,
        edgeDomain:
            location.host.indexOf("hlx.live") !== -1
                ? location.hostname
                : undefined,
        orgId: ALLOY_ORG_ID,
        onBeforeEventSend: function(options) {
            console.debug(`onBeforeEventSend start: ${JSON.stringify(options)}`);
            const experiment = window.getExperiment();
            console.debug("Experiment", experiment);
            options.xdm['_sitesinternal'] = {
                ...options.xdm['_sitesinternal'],
                ...(experiment ? {experiment} : {}),
            };
            console.debug(`onBeforeEventSend complete: ${JSON.stringify(options)}`);
        }
    });

    // TODO: track experiment in XDM
    // TODO: do they need these page details below, should they be picked up automatically?
    /*
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
    */

    await alloy("sendEvent", {
        "documentUnloading": true,
        "xdm": {
            "eventType": "web.webpagedetails.pageViews",
            "web": {
                "webPageDetails": {
                    "pageViews": {
                        "value": 1
                    }
                }
            }
        }
    });
})();
