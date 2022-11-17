function doneURL(requestDetails) 
{
    console.log(`requestSize: ${JSON.stringify(requestDetails.requestSize)}`);
    console.log(`responseSize: ${JSON.stringify(requestDetails.responseSize)}`);
}
browser.webRequest.onCompleted.addListener(
    doneURL, {urls: ["<all_urls>"]},["responseHeaders"]
  );