import puppeteer from 'puppeteer';

const resultsSelector = 'body';

const checkTimetableForADate = async (dateString) => {
    const page = await browser.newPage();
    await page.goto(
        'https://klient.zatokasportu.pl/index.php?s=badminton&date=' + dateString,
        {waitUntil: 'load', timeout: 0}
    );
    await page.waitForSelector(resultsSelector);
    console.log('HUH')
    const body = await page.evaluate(resultsSelector => {
        const textContents = [];
        document.querySelectorAll('body').forEach(item => {
            textContents.push(item.textContent)
        })
        return [...document.querySelectorAll('body')].map(item => item.innerHTML);
    }, resultsSelector);
    return body;
}

const generateNextTwoWeeksDates = () => {
    const todayTimestamp = new Date();
    const dateStrings = [];
 
    for (let i = 0; i < 14; i++) {
        const currentDayTimestamp = new Date();
        currentDayTimestamp.setDate(todayTimestamp.getDate() + i);
        const formatted = currentDayTimestamp.toISOString().split('T')[0];
        dateStrings.push(formatted);
    }

    return dateStrings;
}

const parseMinutesIntToHoursString = (minutesNumber) => {
    const hoursNumber = minutesNumber / 60;
    return `${Math.floor(hoursNumber)}:${minutesNumber % 60}`
}

const extractFreeSlotsFromHTMLString = (htmlString) => {
    let match;
    const entries = [];
    const regex = /data-start="([^"]*)"/g;

    while ((match = regex.exec(htmlString)) !== null) {
        entries.push(match[1]); // match[1] contains the captured value
    }

    return entries;
}

const browser = await puppeteer.launch({ 'args' : [
    '--no-sandbox',
    '--disable-setuid-sandbox'
], headless: false});

const datesToCheck = generateNextTwoWeeksDates();
const data = await checkTimetableForADate(datesToCheck[datesToCheck.length - 3]);
const freeSlots = extractFreeSlotsFromHTMLString(data);

console.log('---------------------------------------------');
console.log('DATE: ', datesToCheck[datesToCheck.length - 3]);
freeSlots.forEach((slotTime) => {
    console.log('slot available: ', parseMinutesIntToHoursString(slotTime))
})
// console.log(freeSlots)

// datesToCheck.forEach(async date => {
//     setTimeout(async () => {
//         console.log(await checkTimetableForADate(date));
//     }, 2000);
// })



