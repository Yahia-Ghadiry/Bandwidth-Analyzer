function formateBytes(bytes)
{
    const units = ["B", "KB", "MB", "GB", "TB", "PB"]
    let unitIndex = 0;
    while (bytes >= 1024)
    {
        bytes /= 1024;
        unitIndex++;
    }
    return [bytes.toPrecision(4).toString() + units[unitIndex], bytes, unitIndex];
}

function toTwodigits(n){
    return n > 9 ? "" + n: "0" + n;
}
// TODO: fix sorce map stuff
// TODO: make all reused function in same place 
function totalUsed(records)
{   
    if(!records)
    {
        return 0;
    }
    let total = 0;
    records.forEach(record =>
    {
        total += record.request_size;
        total += record.response_size;
    });
    return total;
}

// Provids necisary intervals to use in graph
function getIntervals(interval, n, start_date) 
{
    let intervals = [];
    for (let i = 0; i < n; i++)
    {
        const date = new Date();

        switch(interval)
        {
            case "year":
                date.setFullYear(date.getFullYear() - i);
                break;
            
            case "month":
                date.setMonth(date.getMonth() - i);
                break;
            
            case "day":
                date.setDay(date.getDate() - i);
                break;
            
            case "hour":
                date.setHours(date.getHours() - i);
                break;
            default:
                break;
        }


        const year = date.getFullYear().toString();
        const month = toTwodigits(date.getMonth()).toString();
        const week_day = date.getDay().toString();
        const day = toTwodigits(date.getDate()).toString();
        const hour = toTwodigits(date.getHours()).toString();

        switch(interval)
        {
            case "year":
                intervals[i] = year;
                break;
            case "month":
                intervals[i] = year + month;
                break;
            case "day":
                intervals[i] = year + month + week_day + day;
                break;
            case "hour":
                intervals[i] = year + month + week_day + day + hour;
                break;
            default:
                break;
        }
    }

    return intervals;
}

// Gets data from store with n intervals 
async function getValues(table, table_name, intervals, type)
{
    let values = [];    

    for (let i = 0; i < intervals.length; i++)
    {
        const getrecoreds = await table.where("time." + table_name).equals(intervals[i]).toArray();
        if (!getrecoreds[0])
        {
            values[i] = 0;
        }
        if (type == "total")
        {
            values[i] = totalUsed(getrecoreds);
        }
        else
        {
            // TODO:
        }        
    }

    return values;
}

// Provides good labiling for graph
function getLabels()
{
    // TODO: 
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thurday', 'Friday', 'Saturday'];
    return weekDays;
}

async function geLabelsAndValues(table, table_name, n, type = "total", start_date = "")
{   
    // TODO: add a a way to change start date
    const intervals  = getIntervals(table_name, n, start_date);
    const values = await getValues(table, table_name, intervals, type);
    const labels = getLabels(table_name, n, start_date); 
    return [values, labels];
}

async function createGraph()
{
    var db = await new Dexie('Usage');
    db.version(1).stores(
    {
        year: '++id, time.year, [domain+time.year]',
        month: '++id, time.month, [domain+time.month]',
        week_day: '++id, time.week_day, [domain+time.week_day]',
        day: '++id, time.day, [domain+time.day]',
        hour: '++id, time.hour, [domain+time.hour]'
    });
    
    // TODO: make labels better 
    const [labels, values] = await geLabelsAndValues(db.day, "day", 7);

    let  data = 
    {
        labels: labels,
        datasets: 
        [{
            label: 'Usage',
            data: values,
            borderWidth: 1
        }]
    };

    const ctx = document.getElementById('myChart');

    // TODO: add a way to make it clickbale
    // TODO: add a way to make it in terms of KB MB GB not in bytes
    // TODO: make numbers apear on graph
    // TODO: add average
    const stackedBar = new Chart(ctx, 
    {
        type: 'bar',
        data: data,
        options: {
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true
                }
            }
        }
    });
} 
createGraph();