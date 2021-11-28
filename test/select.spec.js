const { sql } = require("../index");

class Base {
  static tableName = '';
  static selectedColumns = [];

  static findBySql(statement) {
    this.selectedColumns = [];
    console.log(statement);
    return sql(statement);
  }

  static select(...columns) {
    this.selectedColumns = columns;
    return this;
  }

  static findAll() {
    return this.findBySql(`select * from \`${this.tableName}\``);
  }

  static findById(id) {
    if (typeof id === 'string') {
      id = parseInt(id, 10);
    }
    return this.where({ id });
  }

  static where(fields={}) {
    let columns = (this.selectedColumns || []).join(", ");
    if (columns.length === 0) {
      columns = "*";
    }

    const whereStr = Object.entries(fields).map(([field, val]) => {
      if (Array.isArray(val)) {
        return `${field} IN(${val.join(",")})`
      }
      return `${field}=${val}`;
      }).join(" AND ");
    return this.findBySql(`select ${columns} from \`${this.tableName}\` where ${ whereStr }`);
  }
}

class Song extends Base {
  static tableName = 'songs';
}

class Album extends Base {
  static tableName = 'albums';
}

describe("SELECT", () => {
  it("select * from 'songs' limit 2", () => {
    Song.findAll().then((results) => {
      console.log("----------------------------------------------");
      console.log("Done");
      console.log(results);
    });
  });

  it("select * from songs where id = 2", () => {
    Song.findAll().then((songs) => {
      songs.forEach((song) => {
        Album.findById(song.album).then((albumResult) => {
          console.log("Album: ");
          console.log(albumResult);
        });
      });
    });
  });

  it("select * from songs where id = 3 and album = 1", () => {
    Song.where({ id: 3, album: 1 }).then((rows) => {
      console.log(rows);
    });
  });

  it.only("select id, album, title from songs where id = 3 and album = 1", () => {
    Song.where({ id: 2 }).then((rows) => {
      console.log(rows);
    });

    Song.select("id", "album", "title").where({ id: 2 }).then((rows) => {
      console.log(rows);
    });

    Song.where({ id: 2 }).then((rows) => {
      console.log(rows);
    });

    Song.where({ id: [1, 2, 3] }).then((rows) => {
      console.log(rows);
    });
  });
});