import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const resultsSelector = 'body';

const checkTimetableForADate = async (browser, dateString) => {
    const page = await browser.newPage();
    await page.goto(
        'https://klient.zatokasportu.pl/index.php?s=badminton&date=' + dateString,
        {waitUntil: 'load', timeout: 0}
    );
    await page.waitForSelector(resultsSelector);
    const body = await page.evaluate(resultsSelector => {
        const textContents = [];
        document.querySelectorAll('body').forEach(item => {
            textContents.push(item.textContent)
        })
        return document.querySelector('body').innerHTML;
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
    const $ = cheerio.load(htmlString);

    // Find elements with background:#00B050
    let slotsForDay = [];
    $('[style*="background:#00B050"]').each((_, el) => {
        const style = $(el).attr('style');
        const timeLength = +style.match(/height:\s*(\d+)/)?.[1]; // only digits, no "px" const timeStart = $(el).attr('data-start');
        const timeStart = +$(el).attr('data-start');

        if (timeLength && timeStart) {
            const hoursLength = timeLength / 60;
            for (let i = 0; i < hoursLength; i++) {
                const startTime = timeStart + (i * 60);
                const existingSlotForThisTime = slotsForDay.find(
                    slot => slot.minutes === startTime
                );
                if (existingSlotForThisTime) {
                    existingSlotForThisTime.courts++;
                } else {
                    slotsForDay.push({
                        minutes: startTime,
                        courts: 1
                    })
                }
            }
        }
    })

    slotsForDay = slotsForDay.map(slot => ({...slot, time: parseMinutesIntToHoursString(slot.minutes)}));

    return slotsForDay.sort((slot1, slot2) => slot1.minutes - slot2.minutes);
};



const datesToCheck = generateNextTwoWeeksDates();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const responseObject = {};

export const initiateBrowser = async () => {
    return await puppeteer.launch({ 'args' : [
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]});
}

export const scrapSchedule = async (browser) => {
    for (const date of datesToCheck) {
        const data = await checkTimetableForADate(browser, date);
        const freeSlots = extractFreeSlotsFromHTMLString(data);
        responseObject[date] = freeSlots;
        await sleep(500)
    }

    return responseObject;
}

export const closeBrowser = async (browser) => {
    await browser.close();
}



