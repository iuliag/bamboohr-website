/* eslint-disable */
const ALLOY_EDGE_CONFIG_ID = '85c35bdc-e6f1-48ae-8169-b06e62ef6a24';
const ALLOY_ORG_ID = '908936ED5D35CC220A495CD4@AdobeOrg';

alloy('configure', {
    debugEnabled: true,
    edgeConfigId: ALLOY_EDGE_CONFIG_ID,
    edgeDomain:
        location.host.indexOf("hlx.live") !== -1
            ? location.hostname
            : undefined,
    orgId: ALLOY_ORG_ID,
});

alloy("sendEvent", {
    "xdm": {
        "web": {
            "webPageDetails": {
                "pageViews": {
                    "value": 1
                }
            }
        }
    }
});
