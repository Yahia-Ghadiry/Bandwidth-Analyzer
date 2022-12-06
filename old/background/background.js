// This is the background script of the addon
// mainly used for sotring usage in an orgized manner
// so that it is easily acessed later on

// intervals of saved data
const intervals = ["year", "month", "week_day", "day", "hour"]


// recursive function so all usage from a frames of a website will be added to same url not to the frame's
function findOrginOfFrame(requestDetails)
{
    if (requestDetails["frameId"])
    {
        return findOrginOfFrame(requestDetails.frameAncestors[0]);
    }
    else
    {
        if (requestDetails["originUrl"])
        {
            return (new URL(requestDetails["originUrl"])).hostname;
        }
        else
        {
            return (new URL(requestDetails["url"])).hostname;
        }
    }
}


// Formats request details so that it removes uncessary details and keeping usefull data in an orginzed way to be easy accisable
function format(requestDetails)
{
    let formatedRecord = {};
    formatedRecord["request_size"] = requestDetails["requestSize"];
    formatedRecord["response_size"] = requestDetails["responseSize"];

    formatedRecord["domain"] = findOrginOfFrame(requestDetails)
    // Formating the date so it's easily searchable
    formatedRecord["time"] = {};
    const date = new Date(requestDetails["timeStamp"]);
    const year = date.getFullYear().toString();
    // tmprearru to simulate privase day usage
    const month = date.getMonth().toString();
    const week_day = date.getDay().toString();
    const day = date.getDate().toString();
    const hour = date.getHours().toString();


    // TODO: add a way to change month beging
    // maybe add a new store where it has only 
    // months and records based on a change

    formatedRecord["time"]["year"] = year;
    formatedRecord["time"]["month"] = year + month;
    formatedRecord["time"]["week_day"] = year + month + week_day;
    formatedRecord["time"]["day"] = year + month + week_day + day;
    formatedRecord["time"]["hour"] = year + month + week_day + day + hour;

    return formatedRecord;
}


const indexedDB = window.indexedDB;

const request = indexedDB.open("Usage", 1);
request.onerror = (event) =>
{
    console.error("An error has occured with indexedDB");
    console.error(event);
};


// Creating store for each interval which has higher storage usage but lower computing usage when quering for data  
request.onupgradeneeded = () =>
{
    const db = request.result;
    let stores = [];
    // TODO: check if this works
    intervals.forEach((interval, index) =>
    {
        // Creats store for each interval
        stores[index] = db.createObjectStore(interval,
        {
            keyPath: 'id',
            autoIncrement: true
        });
        // For checking if stored same domain and time 
        stores[index].createIndex("domain_and_" + interval, ["domain", "time." + interval],
        {
            unique: false
        });
        // For getting total in a peroid
        stores[index].createIndex(interval, "time." + interval,
        {
            unique: false
        });
    });

};


// The process of storing/updating usage
request.onsuccess = (event) =>
{

    // Setting up conection to database
    const db = request.result;

    // Capture requests/response data
    function storeData(requestDetails)
    {

        if (requestDetails.requestSize != 0 || requestDetails.responseSize != 0)
        {
            const formated = format(requestDetails);
            intervals.forEach(interval =>
            {

                const transaction = db.transaction(interval, "readwrite")
                const store = transaction.objectStore(interval);
                const domainIntervalIndex = store.index("domain_and_" + interval);
                // Checks if recored of same domain near same time (5 min) is there if so updates it and doesn't make a new one 
                let checkifexist = domainIntervalIndex.get([formated.domain, formated["time"][interval]]);
                checkifexist.onsuccess = () =>
                {
                    if (checkifexist.result)
                    {
                        result = checkifexist.result;
                        result.request_size += formated["request_size"];
                        result.response_size += formated["response_size"];
                        store.put(result);
                    }
                    else
                    {
                        store.add(formated);
                    }
                }
            });
        }


    }

    browser.webRequest.onCompleted.addListener(
        storeData,
        {
            urls: ["<all_urls>"]
        }, ["responseHeaders"]
    );
};