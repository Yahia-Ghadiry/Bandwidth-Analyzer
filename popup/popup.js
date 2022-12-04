// TODO: add a way to display information

// first retrive info
// secound calculate averages and maciumms 
// third change style of ided elemnts

const intervals = ["year", "month", "week_day", "day", "hour"] 
const request = indexedDB.open("Usage", 1);

// Retruns total usage for givin records  
function totalUsed (records)
{
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
  while(bytes >= 1024)
  {
    bytes /= 1024;
    unitIndex++;
  }
  // makes it so that it shows only second digit of percesion
  bytes = Math.floor(bytes * 100) / 100;
  
  return bytes.toString() + units[unitIndex];
}

// does all calculations neccsary for basic bar graph 
function changeBasicBarGraph(totalUsage, averageUsage, maxUsage)
{
  // Todo: make sure doesn't exceed 100%

  if (maxUsage.usage == 0)
  {
    maxUsage.usage = totalUsage.usage;
  }
  totalUsage.element = document.getElementById(totalUsage.id);
  averageUsage.element = document.getElementById(averageUsage.id);
  maxUsage.element = document.getElementById(maxUsage.id);
  
  // subtract padding
  barWidth = maxUsage.element.offsetWidth - 16;
  
  placeholder = formateBytes(totalUsage.usage);
  totalUsage.element.innerHTML = placeholder;

  totalUsage.element.style.width = ((totalUsage.usage / maxUsage.usage) * barWidth).toString() + "px";
  
  if (averageUsage.usage = 0)
  {
    averageUsage.element.style = "none";
  }
  else
  {
    // subtract one because border has width of 2px
    averageUsage.element.style.width = ((averageUsage.usage / maxUsage.usage) * barWidth - 1).toString() + "px";
  }
}

// Recrusive function to find average and maxmimum value in giving time intervals 
// TODO: fix this function
function averageAndMaximumIntervals(intervals, size, index, currentsum = 0, maximum = 0)
{
  if (size == 0)
  {
    return [currentsum, maximum];
  }
  else
  {
    const getrecoreds = index.getAll(intervals[size - 1]);
    getrecoreds.onsuccess = () =>
    {
      if(!getrecoreds.result)
      {
        return [currentsum, maximum];
      }
      let total = getrecoreds.result.response_size + getrecoreds.result.request_size;
      currentsum += total;
      if(total > maximum)
      {
        maximum = result
      }
      // console.log(getrecoreds)
      // console.log(intervals, size - 1, currentsum, maximum);
      intervals.shift();
      return averageAndMaximumIntervals(intervals, size - 1, index, currentsum, maximum);
    } 
  }
}

// gets all data neccsary for the popupbars
// TODO: add maximum
// TOdo add a way to change languge
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
  console.log(previousMonth);
  const monthRecords = monthIndex.getAll(thisMonth);
  const previousMonthRecords = monthIndex.getAll(previousMonth);
  
  // TODO: check whats wrong with month now 
  monthRecords.onsuccess = () =>
  {
    const monthUsage = totalUsed(monthRecords.result);
    previousMonthRecords.onsuccess =  () =>
    {
      const previuosMonthUsage = totalUsed(previousMonthRecords.result);
      console.log(formateBytes(monthUsage))
      console.log(formateBytes(previousMonth))
      changeBasicBarGraph({id: "monthUsage", usage: monthUsage}, {id: "monthAverage", usage: previuosMonthUsage}, {id: "monthBar", usage: 1024*1024*5})
    };
  };


  
  // Day bar
  const dayTransaction = db.transaction("day", "readwrite")
  const dayStore = dayTransaction.objectStore("day");

  const dayIndex = dayStore.index("day");


  // get average of last 5 days
  let days = [];
  for(let i = 0; i < 3 ; i++)
  {
    let dayDate = new Date();
    dayDate.setDate(date.getDate() - i)
    const year = dayDate.getFullYear().toString();
    const month =   dayDate.getMonth().toString();
    const week_day =  dayDate.getDay().toString();
    const day = dayDate.getDate().toString();
    days[i] = year + month + week_day + day;
  }
  
  let averageDailyUsage = averageAndMaximumIntervals(days, days.length, dayIndex);

  // TODO: think of a way to add average 
  const daysRecords = dayIndex.getAll(days[0])
  daysRecords.onsuccess =  () =>
  {
    const todayUsage = totalUsed(daysRecords.result);
    changeBasicBarGraph({id: "dayUsage", usage: todayUsage}, {id: "dayAverage", usage: 1024*1024*128}, {id: "dayBar", usage: 1024*1024*1024})
  };
  
}
