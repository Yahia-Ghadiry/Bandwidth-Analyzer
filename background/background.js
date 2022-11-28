// Format given data to return only needed data and better handling of long 
function format(requestDetails)
{
    let formatedRecord = {};
    formatedRecord["request_size"] = requestDetails["requestSize"];
    formatedRecord["response_size"] = requestDetails["responseSize"];
    formatedRecord["domain"] = (new URL(requestDetails["originUrl"])).hostname;
    
    // TODO: Think of using UTC timing instead  

    // Formating the date so it's easily searchable
    formatedRecord["time"] = {};
    let date = new Date(requestDetails["timeStamp"]);
    formatedRecord["time"]["year"] = date.getFullYear();
    formatedRecord["time"]["month"] =   date.getMonth();
    formatedRecord["time"]["week_day"] =  date.getDay();
    formatedRecord["time"]["day"] = date.getDate();
    formatedRecord["time"]["hour"] = date.getHours();
    formatedRecord["time"]["minute"] = 5 * Math.round(date.getMinutes() / 5);
    formatedRecord["time"]["hash"] = formatedRecord["time"]["year"].toString() +
        formatedRecord["time"]["month"].toString() + 
        formatedRecord["time"]["week_day"].toString() + 
        formatedRecord["time"]["day"].toString() + 
        formatedRecord["time"]["hour"].toString() + 
        formatedRecord["time"]["minute"].toString();
    return formatedRecord;
}


const indexedDB = window.indexedDB;
     
const request = indexedDB.open("Usage", 1);
request.onerror = (event) => 
{
    console.error("An error has occured with indexedDB");
    console.error(event);
};
request.onupgradeneeded = () => 
{
    const db = request.result;
    const store = db.createObjectStore("record", {keyPath: 'id', autoIncrement: true});

    // usefull later when tring to know usage for certain website
    store.createIndex("domain_and_time", ["domain", "time.hash"], {unique: false});
    
    //  TODO: need better inexing
};

request.onsuccess = (event) =>
{

    // Setting up conection to database
    const db = request.result;
    
    // Capture requests/response data
    function storeData(requestDetails) 
    {    

        if (requestDetails.requestSize != 0 || requestDetails.responseSize !=0)
        {  
            const formated = format(requestDetails);
            const transaction = db.transaction("record", "readwrite")
            const store = transaction.objectStore("record");
            const DTIndex = store.index("domain_and_time");
            // Checks if recored of same domain near same time (5 min) is there if so updates it and doesn't make a new one 
            let checkifexist = DTIndex.get([formated.domain, formated.time.hash]);
            checkifexist.onsuccess = () =>
            {
                if (checkifexist.result)
                {
                    result = checkifexist.result
                    result.request_size += formated["request_size"];
                    result.response_size += formated["response_size"];
                    store.put(result);
                }
                else
                {
                    store.add(formated); 
                    console.log("doesnt'");
                   
                }
            }


        }
    }

    browser.webRequest.onCompleted.addListener(
        storeData, {urls: ["<all_urls>"]},["responseHeaders"]
    );    
};