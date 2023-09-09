const intervals = ["year", "month", "day", "hour"];
var db = new Dexie('Usage');
db.version(1).stores({
    year: '++id, time.year, [domain+time.year]',
    month: '++id, time.month, [domain+time.month]',
    day: '++id, time.day, [domain+time.day]',
    hour: '++id, time.hour, [domain+time.hour]'
});
var tables = [db.year, db.month, db.day, db.hour];

// Format of date YYYYMMWDDHH

// given requestDetails returns the source of request hostname 
function getHostname(requestDetails) {
	let url = typeof requestDetails.documentUrl !== 'undefined' ? requestDetails.documentUrl :  typeof requestDetails.originUrl !== 'undefined' ? requestDetails.originUrl: requestDetails.url;
	let hostname;
	if (url.indexOf("://") > -1)
	{
	    hostname = url.split('/')[2];
	}
	else
	{
	    hostname = url.split('/')[0];
	}
	// find & remove port number
	hostname = hostname.split(':')[0];

	// find & remove "?"
	hostname = hostname.split('?')[0];
    return hostname;

}

// Turns integer into a 2 charchter string 
function toTwodigits(n) {
    return n > 9 ? "" + n : "0" + n;
}

// Formats request details so that it removes uncessary details and keeping usefull data in an orginzed way to be easy accisable
function format(requestDetails) {
    let formattedRecord = {};
    formattedRecord["request_size"] = requestDetails["requestSize"];
    formattedRecord["response_size"] = requestDetails["responseSize"];

    formattedRecord["domain"] = getHostname(requestDetails)
    // Formating the date so it's easily searchable
    formattedRecord["time"] = {};
    const date = new Date(requestDetails["timeStamp"]);
    const year = date.getFullYear().toString();
    const month = toTwodigits(date.getMonth());
    const week_day = date.getDay().toString();
    const day = toTwodigits(date.getDate());
    const hour = toTwodigits(date.getHours());

    formattedRecord["time"]["year"] = year;
    formattedRecord["time"]["month"] = year + month;
    formattedRecord["time"]["week_day"] = year + month + week_day;
    formattedRecord["time"]["day"] = year + month + week_day + day;
    formattedRecord["time"]["hour"] = year + month + week_day + day + hour;

    return formattedRecord;
}


// Stores all trafic/usage
function storeData(requestDetails) {

    if (requestDetails.requestSize != 0 || requestDetails.responseSize != 0) {
        const formatted = format(requestDetails);
        tables.forEach((table, index) => {
            // Checks if recored of same domain near same time (5 min) is there if so updates it and doesn't make a new one 
            db.open().then(() =>
            {
             return  table.where(["domain", "time." + intervals[index]]).equals([formatted.domain,
                formatted["time"][intervals[index]]]).first();
             }).then((checkifexist) =>{
                if (checkifexist) {
                    checkifexist.request_size += formatted["request_size"];
                    checkifexist.response_size += formatted["response_size"];
                    return table.put(checkifexist, checkifexist.id);
                } else {
                    return table.add(formatted);
                }});
            
        });
    }
	else
	{
		console.log(getHostname(requestDetails), requestDetails);
	}
}

browser.webRequest.onCompleted.addListener(storeData, {urls: ["<all_urls>"]});
