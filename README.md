# Bandwidth Analyzer
#### Video Demo:  https://www.youtube.com/watch?v=cpV7uTdiLvQ
#### Description:

This addon tracks bandwidth usage, which is most helpful to those who live in internet-capped countries.

It uses the webRequest API to get request and response information such as Source, request/response size, etc.. 

after that, it is formatted so the URL becomes the domain and the date is better adjusted for easy identification.
and the date is then formated into a string consisting of the: year, month, weekday, day of the month, and hour. There are 6 different variables each having one less date at the end. this is to help with the next step.

I have decided to use 6 "tables" each for the interval so that it is much faster to pull up data for say one year by just looking at the year table than going through the hour table and summing all the values each time it is needed for access although this approach uses much more storage it saves on runtime in the long run. 

then for the pop-up, it gets a record of the usage data for the month and displays it based on the per cent of usage of the higher; past or this month while in the day it gets the average of the previous 30 consecutive days and displays it based on a per cent of highest daily usage one as the 100. There is a button to open a more detailed tab.

The detailed tab displays usage categorized by the top 3 domains or shows Total Usage in a given time interval.
the function getChartData() should be complete so only adjusting parameters and all data necessary to get the chart should be generated 
the first argument that is passed it should be the database store object reference it is used  to know which database to use, the second one is the format type of the chart's x-axis labels it should be almost always the same as the store name but in one where it is needed to get day labels by day of the week it may be different, next is the number of bars that will be shown say for a week that will be seven, next it is chosen what should the graph represent, for now, there are two options "total" which shows the total usage for the given period and there is "detailed" which shows data based on top 3 websites used although there is room for a third which is an uploaded/downloaded graph I have decided against it for as I think total and detailed would be the most useful, lastly there is an offset for date if for say you want to see all the usage of previous week.

Important remarks:
Although all features listed are working (unless specified) for getChartData parameters are changed manually from code and currently has no other way to show them.

Apis used are Chart.js and Dexi.js but chart.js wasn't used for the popup also most of the popup button to open detail style was take from a website specified in it's style sheet , also the icon was obtained from a free png website
