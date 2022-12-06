// TODO: add a way to display information

// first retrive info
// secound calculate averages and maciumms 
// third change style of ided elemnts

const intervals = ["year", "month", "week_day", "day", "hour"];

// Retruns total usage for givin records  
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

// Converts number of bytes to number of KB, MB, etc ..  accordingly
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

// does all calculations neccsary for basic bar graph 
function changeBasicBarGraph(totalUsage, averageUsage, maxUsage)
{   
    // set max usage to something
    if (maxUsage.usage == 0)
    {
        const maxformated = formateBytes(maxUsage.usage);
        maxUsage.usage = Math.ceil(maxformated[1] / 50) * 50 * 1024 **maxformated[2];
    }
    // Make's sure not to exceed 100%
    if (maxUsage.usage < totalUsage.usage)
    {
        maxUsage.usage = totalUsage.usage;
    }
    totalUsage.element = document.getElementById(totalUsage.id);
    averageUsage.element = document.getElementById(averageUsage.id);
    maxUsage.element = document.getElementById(maxUsage.id);

    // subtract padding
    const barWidth = maxUsage.element.offsetWidth - 16;

    const placeholder = formateBytes(totalUsage.usage)[0];
    totalUsage.element.innerHTML = placeholder;

    totalUsage.element.style.width = ((totalUsage.usage / maxUsage.usage) * barWidth).toString() + "px";
    
    if (averageUsage.usage == 0)
    {
        averageUsage.element.style.display = "none";
    }
    else
    {
        // subtract one because border has width of 2px
        averageUsage.element.style.display = "block";
        averageUsage.element.style.width = ((averageUsage.usage / maxUsage.usage) * barWidth - 1).toString() + "px";
    }
}

// Recrusive function to find average and maxmimum value in giving time intervals 
// TODO: fix this function
async function averageAndMaximumIntervals(intervals, table_name, table, currentsum = 0, maximum = 0, summed = 0)
{
    const size = intervals.length; 
    if (size == 0)
    {   
        return [currentsum / (summed == 0 ? 1 : summed), maximum];
    }
    else
    {
        const getrecoreds = await table.where("time." + table_name).equals(intervals[0]).toArray();
        if (!getrecoreds[0])
        {
            return [currentsum / (summed == 0 ? 1 : summed), maximum];
        }
        const total = totalUsed(getrecoreds);
        currentsum += total;
        if (total > maximum)
        {
            maximum = total;
        }
        // console.log(getrecoreds)
        // console.log(intervals, size - 1, currentsum, maximum);
        intervals.shift();
        return await averageAndMaximumIntervals(intervals, table_name, table, currentsum, maximum, summed + 1);
        
    }
}

// gets all data neccsary for the popupbars
// TODO: add maximum
// TODO: add a way to change languge
async function tmp()
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
    // Getting today's date 
    const date = new Date();

    // Month bar
    const thisMonth = date.getFullYear().toString() + date.getMonth().toString();
    // Previous month as the average
    const previouseMonthdate = new Date();
    previouseMonthdate.setMonth(date.getMonth() - 1);
    const previousMonth = previouseMonthdate.getFullYear().toString() + previouseMonthdate.getMonth().toString();

    const monthUsage = totalUsed(await db.month.where("time.month").equals(thisMonth).toArray());
    const previuosMonthUsage = totalUsed(await db.month.where("time.month").equals(previousMonth).toArray());

    // TODO: find appropiate maxium for month bar
    changeBasicBarGraph(
    {
        id: "monthUsage",
        usage: monthUsage
    },
    {
        id: "monthAverage",
        usage: previuosMonthUsage
    },
    {
        id: "monthBar",
        usage: 0
    });
    


    // Day bar

    // get average of last 5 days
    let days = [];
    for (let i = 0; i < 5; i++)
    {
        const dayDate = new Date();
        dayDate.setDate(date.getDate() - i)
        const year = dayDate.getFullYear().toString();
        const month = dayDate.getMonth().toString();
        const week_day = dayDate.getDay().toString();
        const day = dayDate.getDate().toString();
        days[i] = year + month + week_day + day;
    }

    const todatUsage = totalUsed(await db.day.where("time.day").equals(days[0]).toArray());
    const [dayAverage, dayMax] =  await averageAndMaximumIntervals(days, "day", db.day);

    // const  dayMax = 5*1024*1024;
    changeBasicBarGraph(
    {
        id: "dayUsage",
        usage: todatUsage
    },
    {
        id: "dayAverage",
        usage: dayAverage
    },
    {
        id: "dayBar",
        usage: dayMax
        });
}
tmp();