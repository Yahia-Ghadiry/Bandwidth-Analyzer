function logURL(requestDetails) 
{
    console.log(`Loading: ${requestDetails.url}`);
    console.log(`Loaded: help`);
    
    // console.log(`Loaded: L`);

}

function doneURL(requestDetails) 
{
    console.log(`Loaded: ${JSON.stringify(requestDetails)}`);
}
  
browser.webRequest.onBeforeRequest.addListener(
    logURL,
    {urls: ["<all_urls>"]}
  );
browser.webRequest.onCompleted.addListener(
    doneURL, {urls: ["<all_urls>"]},["responseHeaders"]
  );
//   Loaded: {"requestId":"400031",
// "url":"https://ssl.gstatic.com/docs/common/netcheck.gif?zx=mxfqv82sv4nj",
// "originUrl":"https://docs.google.com/spreadsheets/d/1IVMYR86Vjf1GGr6JJfEDadlJy-nblte7kaDDuVGsVl0/edit#gid=1241651430",
// "documentUrl":"https://docs.google.com/spreadsheets/d/1IVMYR86Vjf1GGr6JJfEDadlJy-nblte7kaDDuVGsVl0/edit#gid=1241651430",
// "method":"GET","type":"image",
// "timeStamp":1668685015574,
// "tabId":15,
// "frameId":0,"parentFrameId":-1,
// "incognito":false,"thirdParty":true,
// "cookieStoreId":"firefox-default","fromCache":false,
// "statusCode":200,"statusLine":"HTTP/2.0 200 OK","proxyInfo":null,
// "ip":"142.250.200.195","frameAncestors":[],
// "urlClassification":{"firstParty":[],"thirdParty":[]},"requestSize":0,"responseSize":0}


// Loaded: {"requestId":"401505",
// "url":"https://signaler-pa.clients6.google.com/punctual/multi-watch…aNXa_STfGm2-rGA&CI=0&AID=36&TYPE=xmlhttp&zx=l5e40q1ix3bk&t=1",
// "originUrl":"https://drive.google.com/drive/folders/1fxIPltE5xQgKHrtGQ0e3Trjb6ui-KKpJ?usp=drive_open",
// "documentUrl":"https://drive.google.com/drive/folders/1fxIPltE5xQgKHrtGQ0e3Trjb6ui-KKpJ?usp=drive_open",
// "method":"GET","type":"xmlhttprequest","timeStamp":1668685762960,"tabId":924,"frameId":0,"parentFrameId":-1,"incognito":false,
// "thirdParty":false,"cookieStoreId":"firefox-default","fromCache":false,
// "responseHeaders":[{"name":"cache-control","value":"private, max-age=0"},{"name":"x-content-type-options","value":"nosniff"},{"name":"content-type","value":"text/plain; charset=utf-8"},{"name":"date","value":"Thu, 17 Nov 2022 11:49:22 GMT"},{"name":"server","value":"ESF"},{"name":"x-xss-protection","value":"0"},{"name":"x-frame-options","value":"SAMEORIGIN"},{"name":"access-control-allow-origin","value":"https://drive.google.com"},{"name":"vary","value":"origin"},{"name":"access-control-allow-credentials","value":"true"},{"name":"alt-svc","value":"h3=\":443\"; ma=2592000,h3-29=\":443\"; ma=2592000,h3-Q050=\":443\"; ma=2592000,h3-Q046=\":443\"; ma=2592000,h3-Q043=\":443\"; ma=2592000,quic=\":443\"; ma=2592000; v=\"46,43\""},{"name":"X-Firefox-Spdy","value":"h2"}],"statusCode":200,"statusLine":"HTTP/2.0 200 OK",
// "proxyInfo":null,"ip":"216.58.212.106","frameAncestors":[],"urlClassification":{"firstParty":["tracking_content","any_strict_tracking"],"thirdParty":[]},"requestSize":0,"responseSize":0}