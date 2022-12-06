// TODO: add a way to display information

// first retrive info
// secound calculate averages and maciumms 
// third change style of ided elemnts

const intervals = ["year", "month", "week_day", "day", "hour"]
const request = indexedDB.open("Usage", 1);

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
        let maxformated = formateBytes(maxUsage.usage);
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
    barWidth = maxUsage.element.offsetWidth - 16;

    placeholder = formateBytes(totalUsage.usage)[0];
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
// function averageAndMaximumIntervals(intervals, size, index, currentsum = 0, maximum = 0)
// {
//     if (size == 0)
//     {
//         return [currentsum, maximum];
//     }
//     else
//     {
//         const getrecoreds = index.getAll(intervals[size - 1]);
//         getrecoreds.onsuccess = () =>
//         {
//             if (!getrecoreds.result.length)
//             {
//                 return [0,1]; 
//             }
//             let total = getrecoreds.result.response_size + getrecoreds.result.request_size;
//             currentsum += total;
//             if (total > maximum)
//             {
//                 maximum = total;
//             }
//             // console.log(getrecoreds)
//             // console.log(intervals, size - 1, currentsum, maximum);
//             intervals.shift();
//             return [1,1];
//             // return averageAndMaximumIntervals(intervals, size - 1, index, currentsum, maximum);
//         }
//     }
// }

// gets all data neccsary for the popupbars
// TODO: add maximum
// TODO: add a way to change languge
request.onsuccess = (event) =>
{
    // Getting today's date 
    const date = new Date();
    const db = request.result;

    // Month bar
    const monthTransaction = db.transaction("month", "readwrite")
    const monthStore = monthTransaction.objectStore("month");
    const monthIndex = monthStore.index("month");

    const thisMonth = date.getFullYear().toString() + date.getMonth().toString();
    // Previous month as the average
    let previouseMonthdate = new Date();
    previouseMonthdate.setMonth(date.getMonth() - 1);
    const previousMonth = previouseMonthdate.getFullYear().toString() + previouseMonthdate.getMonth().toString();
    const monthRecords = monthIndex.getAll(thisMonth);
    const previousMonthRecords = monthIndex.getAll(previousMonth);

    // TODO: check whats wrong with month now 
    monthRecords.onsuccess = () =>
    {
        const monthUsage = totalUsed(monthRecords.result);
        previousMonthRecords.onsuccess = () =>
        {
            const previuosMonthUsage = totalUsed(previousMonthRecords.result);
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
            })
        };
    };


    // Day bar
    const dayTransaction = db.transaction("day", "readwrite")
    const dayStore = dayTransaction.objectStore("day");

    const dayIndex = dayStore.index("day");


    // get average of last 5 days
    let days = [];
    for (let i = 0; i < 5; i++)
    {
        let dayDate = new Date();
        dayDate.setDate(date.getDate() - i)
        const year = dayDate.getFullYear().toString();
        const month = dayDate.getMonth().toString();
        const week_day = dayDate.getDay().toString();
        const day = dayDate.getDate().toString();
        days[i] = year + month + week_day + day;
    }

    // const dayAverage =  averageAndMaximumIntervals(days, days.length, dayIndex);
    // const  dayMax = 5*1024*1024;
    // const [dayAverage, dayMax] = averageAndMaximumIntervals(days, 1, dayIndex);
    // TODO: bad impletion fix it

    let daysRecords = [];
    let daysUsages = [];
    for (let i = 0; i < 5; i++)
    {
        daysRecords[i] = dayIndex.getAll(days[i]);
    }
    daysRecords[0].onsuccess = () =>
    {
        daysUsages[0] = totalUsed(daysRecords[0].result);
        daysRecords[1].onsuccess = () =>
        {
            daysUsages[1] = totalUsed(daysRecords[1].result);
            daysRecords[2].onsuccess = () =>
            {
                daysUsages[2] = totalUsed(daysRecords[2].result);
                daysRecords[3].onsuccess = () =>
                {    
                    daysUsages[3] = totalUsed(daysRecords[3].result);
                    daysRecords[4].onsuccess = () =>
                    {
                        daysUsages[4] = totalUsed(daysRecords[4].result);
                        let dayAverage = 0;
                        let dayMax = 0;
                        let total = 0;
                        let count = 0;
                        for (let i = 1; i < 5; i++)
                        {

                            if(daysUsages[i] > dayMax)
                            {
                                dayMax = daysUsages[i]
                            }
                            if(!daysUsages[i])
                            {
                                total += daysUsages[i]
                                count++;
                            }
                            
                        }
                        dayAverage = total / count;
                        changeBasicBarGraph(
                        {
                            id: "dayUsage",
                            usage: daysUsages[0]
                        },
                        {
                            id: "dayAverage",
                            usage: dayAverage
                        },
                        {
                            id: "dayBar",
                            usage: dayMax
                        });
                    };
                };
            };
        };
    };

}