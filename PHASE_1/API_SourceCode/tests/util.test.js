const util = require("../util");

// Test correct time formats.
test("test_correct_time_format_1", async () => {
    // "T" in the middle is replaced by a space
    let timestamp = "2022-03-13T13:00:00";
    expect(util.timeFormatCorrect(timestamp)).toBe(true);
});

test("test_correct_time_format_2", async () => {
    // "T" in the middle is replaced by a space
    let timestamp = "1999-01-13T24:11:02";
    expect(util.timeFormatCorrect(timestamp)).toBe(true);
});

// Test incorrect time formats.
test("test_invalid_time_format_1", async () => {
    // "T" in the middle is replaced by a space
    let timestamp = "2022-03-13 13:00:00";
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
});

test("test_invalid_time_format_2", async () => {
    // "T" replaced by "Z"
    let timestamp = "2022-03-13Z13:00:00";
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
});

test("test_invalid_time_format_3", async () => {
    // invalid day
    let timestamp = "2022-03-1T13:00:00";
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
});

test("test_invalid_time_format_4", async () => {
    // invalid month
    let timestamp = "2022-3-13T13:00:00";
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
});

test("test_invalid_time_format_5", async () => {
    // invalid hour
    let timestamp = "2022-03-13T9:00:00";
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
});

test("test_invalid_time_format_6", async () => {
    // invalid hour #2 (too big)
    let timestamp = "2022-03-13T99:00:00";
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
});

test("test_invalid_time_format_7", async () => {
    let timestamp = "2022-03-13T25:00:00 ";
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
});

test("test_invalid_time_format_8", async () => {
    // invalid minutes
    let timestamp = "2022-03-13T19:60:00";
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
    timestamp = "2022-03-13T19:99:00";
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
});

test("test_invalid_time_format_9", async () => {
    // invalid seconds
    let timestamp = "2022-03-13T19:00:60";
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
    timestamp = "2022-03-13T19:00:78";
    expect(util.timeFormatCorrect(timestamp)).toBe(false);
});

test("test_findNull_function_1", async() => {
    let object = {
        "period_of_interest_start": "2022-03-13T19:00:00",
        "period_of_interest_end": "2022-03-18T19:00:00",
        "key_terms": "ebola,COVID-19",
        "location": "Bhutan"
    };

    let keys = ["period_of_interest_start", "period_of_interest_end", "key_terms", "location"];

    // Should work (return null) as all fields of the object exist
    expect(util.findNull(object, keys)).toBe(null);
});

test("test_findNull_function_2", async() => {
    let object = {
        "period_of_interest_start": null,
        "period_of_interest_end": "2022-03-18T19:00:00",
        "key_terms": "ebola,COVID-19",
        "location": "Bhutan"
    };

    let keys = ["period_of_interest_start", "period_of_interest_end", "key_terms", "location"];

    // period_of_interest_start is null
    expect(util.findNull(object, keys)).toBe("period_of_interest_start");
});

test("test_findNull_function_3", async() => {
    let object = {
        "period_of_interest_end": "2022-03-18T19:00:00",
        "key_terms": "ebola,COVID-19",
        "location": "Bhutan"
    };

    let keys = ["period_of_interest_start", "period_of_interest_end", "key_terms", "location"];

    // period_of_interest_start does not exist
    expect(util.findNull(object, keys)).toBe("period_of_interest_start");
});

test("test_findNull_function_4", async() => {
    let object = {
        "period_of_interest_start": "2022-03-13T19:00:00",
        "period_of_interest_end": "2022-03-18T19:00:00",
        "location": "Bhutan"
    };

    let keys = ["period_of_interest_start", "period_of_interest_end", "key_terms", "location"];

    // period_of_interest_start does not exist
    expect(util.findNull(object, keys)).toBe("key_terms");
});

test("test_findNotString_function_1", async() => {
    let object = {
        "period_of_interest_start": "2022-03-13T19:00:00",
        "period_of_interest_end": "2022-03-18T19:00:00",
        "key_terms": "ebola,COVID-19",
        "location": "Bhutan"
    };

    let keys = ["period_of_interest_start", "period_of_interest_end", "key_terms", "location"];

    // above input is valid
    expect(util.findNotString(object, keys)).toBe(null);
});

test("test_findNotString_function_2", async() => {
    let object = {
        "period_of_interest_start": "2022-03-13T19:00:00",
        "period_of_interest_end": "2022-03-18T19:00:00",
        "key_terms": ["ebola", "COVID-19"],
        "location": "Bhutan"
    };

    let keys = ["period_of_interest_start", "period_of_interest_end", "key_terms", "location"];

    // period_of_interest_start does not exist (key_terms should NOT be a list, but comma-separated string)
    expect(util.findNotString(object, keys)).toBe("key_terms");
});

test("test_findNotString_function_3", async() => {
    let object = {
        "period_of_interest_start": "2022-03-13T19:00:00",
        "period_of_interest_end": "2022-03-18T19:00:00",
        "key_terms": "ebola,COVID-19",
        "location": false
    };
    
    let keys = ["period_of_interest_start", "period_of_interest_end", "key_terms", "location"];

    // location is for some reason a boolean value
    expect(util.findNotString(object, keys)).toBe("location");
});

test("test_findNotString_function_4", async() => {
    let object = {
        "period_of_interest_start": "2022-03-13T19:00:00",
        "period_of_interest_end": "2022-03-18T19:00:00",
        "key_terms": "ebola,COVID-19",
        "location": 42
    };

    let keys = ["period_of_interest_start", "period_of_interest_end", "key_terms", "location"];

    // location is for some reason an integer value
    expect(util.findNotString(object, keys)).toBe("location");
});

test("test_findNotString_function_5", async() => {
    let object = {
        "period_of_interest_start": "2022-03-13T19:00:00",
        "period_of_interest_end": null,
        "key_terms": "ebola,COVID-19",
        "location": "Lithuania"
    };

    let keys = ["period_of_interest_start", "period_of_interest_end", "key_terms", "location"];

    // no end date has been given (hence is null != string)
    expect(util.findNotString(object, keys)).toBe("period_of_interest_end");
});