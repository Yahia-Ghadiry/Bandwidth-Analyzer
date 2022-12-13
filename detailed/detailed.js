function formatBytes(bytes)
{
    const units = ["B", "KB", "MB", "GB", "TB", "PB"]
    let unitIndex = 0;
    while (bytes >= 1024)
    {
        bytes /= 1024;
        unitIndex++;
    }
    const formatted = (bytes == 0) ? 0 : bytes.toPrecision(4).toString() + " " + units[unitIndex];
    return [formatted, bytes, unitIndex];
}

// Turns integer into a 2 charchter string 
function toTwodigits(n)
{
    return n > 9 ? "" + n : "0" + n;
}
// Calculates total value of each day
function totalUsage(records)
{
    let values = [];
    for (let i = 0; i < records.length; i++)
    {
        if (!records[i])
        {
            values[i] = 0;

        }
        else
        {
            let total = 0;
            records[i].forEach(record =>
            {
                total += record.request_size;
                total += record.response_size;
            });
            values[i] = total;
        }
    }
    return values.reverse()
}
// returns values and secondary labels for top3
function detailedUsage(records)
{
    let domains = {};
    // Summs all 
    for (let i = 0; i < records.length; i++)
    {
        for (let j = 0; j < records[i].length; j++)
        {
            if (records[i][j])
            {
                let total = records[i][j].request_size + records[i][j].response_size;
                if (!domains[records[i][j].domain])
                {
                    domains[records[i][j].domain] = total;
                }
                else
                {
                    domains[records[i][j].domain] += records[i][j].request_size + records[i][j].response_size;
                }
            }
        }
    }

    // Sorts and findsd top 3  
    let top3 = Object.keys(domains).map((key) =>
    {
        return [key, domains[key]];
    });

    top3.sort((a, b) =>
    {
        return b[1] - a[1];
    });

    top3 = top3.slice(0, 3);
    top3 = top3.map((item) =>
    {
        return item[0]
    });
    top3[3] = "other";
    let values = [[], [], [], []];
    for (let i = 0; i < records.length; i++)
    {
        let otherSum = 0;
        let found1 = false;
        let found2 = false;
        let found3 = false;
        for (let j = 0; j < records[i].length; j++)
        {
            let total = records[i][j].request_size + records[i][j].response_size;

            if (records[i][j].domain == top3[0])
            {
                values[0][i] = total;
                found1 = true;
            }
            else if (records[i][j].domain == top3[1])
            {
                values[1][i] = total;
                found2 = true;

            }
            else if (records[i][j].domain == top3[2])
            {
                values[2][i] = total;
                found3 = true;
            }
            else
            {
                otherSum += total;

            }

        }
        values[3][i] = otherSum;
        if (!found1)
        {
            values[0][i] = 0;
        }
        if (!found2)
        {
            values[1][i] = 0;
        }
        if (!found3)
        {
            values[2][i] = 0;
        }
    }
    for (let i = 0; i < 4; i++)
    {
        values[i].reverse()
    }
    return [values, top3];
}

// Provids necisary intervals to use in graph
function getIntervals(interval, n, start_date)
{
    let intervals = [];
    for (let i = 0; i < n; i++)
    {
        const date = new Date(start_date);
        switch (interval)
        {
            case "year":
                date.setFullYear(date.getFullYear() - i);
                break;

            case "month":
                date.setMonth(date.getMonth() - i);
                break;
            case "day":
                date.setDate(date.getDate() - i);
                break;
            case "hour":
                date.setHours(date.getHours() - i);
                break;
        }


        const year = date.getFullYear().toString();
        const month = toTwodigits(date.getMonth());
        const week_day = date.getDay().toString();
        const day = toTwodigits(date.getDate());
        const hour = toTwodigits(date.getHours());

        switch (interval)
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
        }
    }

    return intervals;
}

// Gets data from store with n intervals 
async function getRecords(table, table_name, intervals)
{
    let records = [];

    for (let i = 0; i < intervals.length; i++)
    {
        const getrecoreds = await table.where("time." + table_name).equals(intervals[i]).toArray();
        if (!getrecoreds[0])
        {
            records[i] = 0;
        }
        else
        {
            records[i] = getrecoreds;
        }
    }

    return records;
}

function getValuesAndSecLabels(records, type)
{
    if (type == "total")
    {
        return [totalUsage(records), NaN];
    }
    else(type == "detailed")
    {

        return detailedUsage(records);
    }
}

// Provides good labiling for graph
function getLabels(format, intervals)
{   
    const n = intervals.length;
    let labels = [];
    const months = ["January","February","March","April","May","June","July",
    "August","September","October","November","December"];

    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thurday', 'Friday', 'Saturday'];
    const hours = Array.from({length: 24}, (_, i) => i + ":00 - " + (i +1) + ":00" );
    for (let i = 0; i < n; i++)
    {
        switch (format)
        {
            case "year":
                labels[i] = intervals[i].slice(0, 4);
                break;

            case "month":
                labels[i] = months[parseInt(intervals[i].slice(4, 6))];
                break;

            case "week_day":
                labels[i] = weekDays[parseInt(intervals[i].slice(6, 7))];
                break;

            case "day":
                labels[i] = parseInt(intervals[i].slice(7, 9));
               break;

            case "hour":
                labels[i] = hours[parseInt(intervals[i].slice(9))];
                break;
        }
    }
    return labels.reverse();
}

// Returns data for chart
async function geChartData(table, format, n, type = "total", start_date = new Date())
{
    const table_name = (format == "week_day") ? "day": format;
    const intervals = getIntervals(table_name, n, start_date);
    const records = await getRecords(table, table_name, intervals);
    const [values, secLabels] = getValuesAndSecLabels(records, type)
    const labels = getLabels(format, intervals);
    let data;
    if (type == "detailed")
    {

        data = {
            labels: labels,
            datasets: [
            {
                label: secLabels[3],
                data: values[3],
                borderWidth: 1
            },
            {
                label: secLabels[2],
                data: values[2],
                borderWidth: 1
            },
            {
                label: secLabels[1],
                data: values[1],
                borderWidth: 1
            },
            {
                label: secLabels[0],
                data: values[0],
                borderWidth: 1
            }]
        };
    }
    else
    {
        data = {
            labels: labels,
            datasets: [
            {
                label: 'Total Usage',
                data: values,
                borderWidth: 1
            }]
        };
    }
    
    
    return data;
}

async function createGraph()
{
    const db = await new Dexie('Usage');
    db.version(1).stores(
    {
        year: '++id, time.year, [domain+time.year]',
        month: '++id, time.month, [domain+time.month]',
        day: '++id, time.day, [domain+time.day]',
        hour: '++id, time.hour, [domain+time.hour]'
    });

    let start_date = new Date();
    
    const data = await geChartData(db.hour, "hour", 9, "detailed", start_date);

    const ctx = document.getElementById('myChart');

    const stackedBar = new Chart(ctx,
    {
        type: 'bar',
        data: data,
        options:
        {
            scales:
            {
                x:
                {
                    stacked: true
                },
                y:
                {
                    stacked: true,
                    ticks:
                    {
                        // Show size in KB MB GB TB instead of Bytes
                        callback: (value, index, ticks) =>
                        {
                            return formatBytes(value)[0];
                        }

                    }
                }
            }
        }
    });
}
createGraph();