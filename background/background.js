const intervals = ["year", "month", "day", "hour"];
// Format of date YYYYMMWDDHH
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

// Turns integer into a 2 charchter string 
function toTwodigits(n)
{
    return n > 9 ? "" + n : "0" + n;
}

// Formats request details so that it removes uncessary details and keeping usefull data in an orginzed way to be easy accisable
function format(requestDetails)
{
    let formattedRecord = {};
    formattedRecord["request_size"] = requestDetails["requestSize"];
    formattedRecord["response_size"] = requestDetails["responseSize"];

    formattedRecord["domain"] = findOrginOfFrame(requestDetails)
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
async function storeData(requestDetails)
{
    const db = new Dexie('Usage');
    db.version(1).stores(
    {
        year: '++id, time.year, [domain+time.year]',
        month: '++id, time.month, [domain+time.month]',
        day: '++id, time.day, [domain+time.day]',
        hour: '++id, time.hour, [domain+time.hour]'
    });

    const tables = [db.year, db.month, db.day, db.hour];

    if (requestDetails.requestSize != 0 || requestDetails.responseSize != 0)
    {
        const formatted = format(requestDetails);
        tables.forEach(async (table, index) =>
        {
            // Checks if recored of same domain near same time (5 min) is there if so updates it and doesn't make a new one 
            const checkifexist = await table.where(["domain", "time." + intervals[index]]).equals([formatted.domain, formatted["time"][intervals[index]]]).first();
            if (checkifexist)
            {
                checkifexist.request_size += formatted["request_size"];
                checkifexist.response_size += formatted["response_size"];
                await table.put(checkifexist, checkifexist.id);
            }
            else
            {
                await table.add(formatted);
            }
        });
    }
}

browser.webRequest.onCompleted.addListener(
    (requestDetails) =>
    {
        storeData(requestDetails).then();
    },
    {
        urls: ["<all_urls>"]
    }, ["responseHeaders"]
);