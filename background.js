function storeData(requestDetails) 
{
    if (requestDetails.requestSize != 0 || requestDetails.responseSize !=0)
    {
        console.log(`requestSize: ${JSON.stringify(requestDetails.requestSize)}`);
        console.log(`responseSize: ${JSON.stringify(requestDetails.responseSize)}`);
    }
}
browser.webRequest.onCompleted.addListener(
    storeData, {urls: ["<all_urls>"]},["responseHeaders"]
  );