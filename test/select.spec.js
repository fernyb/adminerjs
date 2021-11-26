const { sql } = require("../index");

describe("SELECT", () => {
  it("select * from 'songs' limit 2", () => {
    sql("select * from `songs` order by rank desc limit 2").then((results) => {
      console.log("SQL RESULTS: ", results);
    });
  });
});