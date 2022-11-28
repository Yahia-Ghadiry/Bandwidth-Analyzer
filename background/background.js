// Format given data to return only needed data and better handling of long 
const intervals = ["year", "month", "week_day", "day", "hour", "minute"] 
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
    const year = date.getFullYear().toString();
    const month =   date.getMonth().toString();
    const week_day =  date.getDay().toString();
    const day = date.getDate().toString();
    const hour = date.getHours().toString();
    // Rounds so it only keeps every ten minuts
    const minute = (5 * Math.round(date.getMinutes() / 5)).toString();
    
    formatedRecord["time"]["year"] = year;
    formatedRecord["time"]["month"] = year + month;
    formatedRecord["time"]["week_day"] = year + month + week_day;
    formatedRecord["time"]["day"] = year + month + week_day + day;
    formatedRecord["time"]["hour"] = year + month + week_day + day + hour;
    formatedRecord["time"]["minute"] = year + month + week_day + day + hour + minute;

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
    const yStore = db.createObjectStore("year", {keyPath: 'id', autoIncrement: true});
    const moStore = db.createObjectStore("month", {keyPath: 'id', autoIncrement: true});
    const wStore = db.createObjectStore("week_day", {keyPath: 'id', autoIncrement: true});
    const dStore = db.createObjectStore("day", {keyPath: 'id', autoIncrement: true});
    const hStore = db.createObjectStore("hour", {keyPath: 'id', autoIncrement: true});
    const miStore = db.createObjectStore("minute", {keyPath: 'id', autoIncrement: true});
    const stores = [yStore, moStore, wStore, dStore, hStore, miStore]
    
    stores.forEach((store, index, stores) => 
    {
        store.createIndex("domain_and_" + intervals[index], ["domain", "time." + intervals[index]], {unique: false});
    });
    
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
            intervals.forEach((interval, index, intervals) =>
            {
            
                const transaction = db.transaction(interval, "readwrite")
                const store = transaction.objectStore(interval);
                const DTIndex = store.index("domain_and_" + interval);
                // Checks if recored of same domain near same time (5 min) is there if so updates it and doesn't make a new one 
                let checkifexist = DTIndex.get([formated.domain, formated["time"][interval]]);
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
        storeData, {urls: ["<all_urls>"]},["responseHeaders"]
    );
};