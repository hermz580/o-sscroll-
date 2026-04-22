import { getZodiac } from './zodiac.ts';

function runTests() {
    console.log("Starting tests for getZodiac...");

    const testCases: [string, string | null][] = [
        ["1990-01-15", "Capricorn"],
        ["1990-01-20", "Aquarius"],
        ["1990-02-18", "Aquarius"],
        ["1990-02-19", "Pisces"],
        ["1990-03-20", "Pisces"],
        ["1990-03-21", "Aries"],
        ["1990-04-19", "Aries"],
        ["1990-04-20", "Taurus"],
        ["1990-05-20", "Taurus"],
        ["1990-05-21", "Gemini"],
        ["1990-06-20", "Gemini"],
        ["1990-06-21", "Cancer"],
        ["1990-07-22", "Cancer"],
        ["1990-07-23", "Leo"],
        ["1990-08-22", "Leo"],
        ["1990-08-23", "Virgo"],
        ["1990-09-22", "Virgo"],
        ["1990-09-23", "Libra"],
        ["1990-10-22", "Libra"],
        ["1990-10-23", "Scorpio"],
        ["1990-11-21", "Scorpio"],
        ["1990-11-22", "Sagittarius"],
        ["1990-12-21", "Sagittarius"],
        ["1990-12-22", "Capricorn"],
        ["", null],
        ["invalid-date", null],
        ["2024-02-29", "Pisces"],
    ];

    let passed = 0;
    for (const [date, expected] of testCases) {
        try {
            const result = getZodiac(date);
            if (result === expected) {
                passed++;
            } else {
                console.error(`For ${date}, expected ${expected} but got ${result}`);
            }
        } catch (e) {
            console.error(`Error testing ${date}: `, e);
        }
    }

    console.log(`Tests finished: ${passed}/${testCases.length} passed.`);
    if (passed !== testCases.length) {
        process.exit(1);
    }
}

runTests();
