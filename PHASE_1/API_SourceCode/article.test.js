const util = require("./util");

test("test_invalid_time_format", async () => {
    // 'T' in the middle is replaced by a space
    let timestamp = '2022-03-13 13:00:00'
    expect(util.timeFormatCorrect(timestamp)).toBe(false);

    // 'T' replaced by 'Z'
    timestamp = '2022-03-13Z13:00:00'
    expect(util.timeFormatCorrect(timestamp)).toBe(false);

    // invalid day
    timestamp = '2022-03-1T13:00:00'
    expect(util.timeFormatCorrect(timestamp)).toBe(false);

    // invalid month
    timestamp = '2022-3-13T13:00:00'
    expect(util.timeFormatCorrect(timestamp)).toBe(false);

    // invalid hour
    timestamp = '2022-03-13T9:00:00'
    expect(util.timeFormatCorrect(timestamp)).toBe(false);

    // invalid hour #2 (too big)
    timestamp = '2022-03-13T99:00:00'
    expect(util.timeFormatCorrect(timestamp)).toBe(false);

    // invalid hour #3 (just over 24)
    timestamp = '2022-03-13T25:00:00'
    expect(util.timeFormatCorrect(timestamp)).toBe(false);

    // invalid minutes
    timestamp = '2022-03-13T19:60:00'
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
    timestamp = '2022-03-13T19:99:00'
    expect(util.timeFormatCorrect(timestamp)).toBe(false);

    // invalid seconds
    timestamp = '2022-03-13T19:00:60'
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
    timestamp = '2022-03-13T19:00:78'
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
});
