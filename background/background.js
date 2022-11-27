// Format given data to return only needed data and better handling of long 
function format(requestDetails)
{
    let formatedRecord = {};
    formatedRecord["time_stamp"] = requestDetails["timeStamp"];
    formatedRecord["reques_size"] = requestDetails["requestSize"];
    formatedRecord["response_size"] = requestDetails["responseSize"];
    formatedRecord["domain"] = (new URL(requestDetails["originUrl"])).hostname;

    // Formating the date so it's easily searchable
    let date = new Date(requestDetails["timeStamp"]);
    formatedRecord["year"] = date.getFullYear();
    formatedRecord["month"] =   date.getMonth();
    formatedRecord["day"] = date.getDate();
    formatedRecord["hour"] = date.getHours();
    formatedRecord["minute"] = 5 * Math.round(date.getMinutes() / 5);
    formatedRecord["week_day"] =  date.getDay();

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
    const store = db.createObjectStore("record", {keyPath: "time_stamp"});
    // store.createIndex("method", "method", {unique: false});
    // store.createIndex("type", "type", {unique: false});
    // store.createIndex("ip", "ip", {unique: false});
    
    //  TODO: need better inexing
};

request.onsuccess = (event) =>
{

    // Setting up conection to database
    const db = request.result;
    // const methodIndex = store.index("method");
    // const ipIndex = store.index("ip");

    // Capture requests/response data
    function storeData(requestDetails) 
    {    
        console.log(format(requestDetails));

        if (requestDetails.requestSize != 0 || requestDetails.responseSize !=0)
        {  
            const formated = format(requestDetails);
            console.log(format(requestDetails));
            const transaction = db.transaction("record", "readwrite")
            const store = transaction.objectStore("record");
            store.add(formated);

        }
    }

    browser.webRequest.onCompleted.addListener(
        storeData, {urls: ["<all_urls>"]},["responseHeaders"]
    );

    // setInterval(() =>
    // {
    //     let methodQuery = methodIndex.getAll("GET");    
    //     methodQuery.onsuccess = () =>
    //     {
    //         console.log("idQuery", methodQuery.result);
    //     };
    // }
    // , 1000);

    // transaction.oncomplete = () =>
    // {
    //     db.close;
    // };
    
};







// const dbName = "BWUsageLog";

// const request = indexedDB.open(dbName, 2);
// const customerData = [
//     { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
//     { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" }
//   ];
// request.onerror = (event) => {
//   // Handle errors.
// };
// request.onupgradeneeded = (event) => {
//   const db = event.target.result;

//   // Create an objectStore to hold information about our customers. We're
//   // going to use "ssn" as our key path because it's guaranteed to be
//   // unique - or at least that's what I was told during the kickoff meeting.
//   const objectStore = db.createObjectStore("customers", { keyPath: "ssn" });

//   // Create an index to search customers by name. We may have duplicates
//   // so we can't use a unique index.
//   objectStore.createIndex("name", "name", { unique: false });

//   // Create an index to search customers by email. We want to ensure that
//   // no two customers have the same email, so use a unique index.
//   objectStore.createIndex("email", "email", { unique: true });

//   // Use transaction oncomplete to make sure the objectStore creation is
//   // finished before adding data into it.
//   objectStore.transaction.oncomplete = (event) => {
//     // Store values in the newly created objectStore.
//     const customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");
//     customerData.forEach((customer) => {
//       customerObjectStore.add(customer);
//     });
//   };