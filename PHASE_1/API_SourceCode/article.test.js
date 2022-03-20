const db = require("./database");
const { server } = require("./server");

/*
beforeEach(async () => {
  await db.connect(Mockgoose);
  await fixtures();
  server = await app.listen(4000);
  global.agent = request.agent(server);
});*/

afterEach(async () => {
  //await server.close();
  //await conn.destroy();  //db.disconnect();
});


test("test_invalid_time_format", async () => {
    let conn;
	try {
        conn = await db.createConnectionPool();
	} catch (error) {
	    console.log("Failed to connect to database.");
		console.log(error);
		return;
    }

    // 'T' in the middle is replaced by a space
    let timestamp = '2022-03-13 13:00:00'
    expect(server.timeFormatCorrect(timestamp)).toBeFalsy();

    await conn.destroy();
});
