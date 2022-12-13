# YOUR PROJECT TITLE
#### Video Demo:  https://www.youtube.com/watch?v=cpV7uTdiLvQ
#### Description:

This addon tracks bandwidth usage, which is most helpful to those who live in internet-capped countries.

It uses the webRequest API to get request and response information such as Source, request/response size, etc.. 

after that, it is formatted so the URL becomes the domain and the date is better adjusted for easy identification.
and the date is then formated into a string consisting of the: year, month, weekday, day of the month, and hour. There are 6 different variables each having one less date at the end. this is to help with the next step.

I have decided to use 6 "tables" each for the interval so that it is much faster to pull up data for say one year by just looking at the year table than going through the hour table and summing all the values each time it is needed for access although this approach uses much more storage it saves on runtime in the long run. 

then for the pop-up, it gets a record of the usage data for the month and displays it based on the per cent of usage of the higher; past or this month while in the day it gets the average of the previous 30 consecutive days and displays it based on a per cent of highest daily usage one as the 100 and there is a button to open a more detailed tab.

In the detailed tab it displays usage categorized by top 3 domains or just shows Total usage in a given time interval.

Important remarks;
I have since add a simple display for how it should look but it needs furthere coding but i thinks this is enough for this project as term finals approach