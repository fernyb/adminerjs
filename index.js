const axios = require("axios").default;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const FormData = require("form-data");

const url = "https://demo.adminer.org/adminer.php?username=&db=a264133_1ho7o13j&sql=";

function cookie() {
  return "adminer_permanent=; adminer_sid=h2ing8vga2m138g20d1ho7o13j";
}

function getToken() {
  return new Promise((resolve) => {
    axios.create({
      headers: {
        "Cookie": cookie()
      }
    }).get(url).then((resp) => {
      const { document } = (new JSDOM(resp.data)).window;
      const token = document.querySelector("input[name=token]").getAttribute("value");
      resolve(token);
    });
  });
}

function executeSQL(statement) {
  const form = new FormData();
  form.append("query", statement);
  form.append("limit", "");

  return new Promise((resolve, reject) => {
    getToken().then((token) => {
      form.append("token", token);
    }).then(() => {
      axios.create({
        headers: {
          ...form.getHeaders(),
          "Cookie": cookie(),
          "cache-control": "max-age=0",
          "Content-Length": form.getLengthSync(),
        },
      })
      .post(url, form)
      .then((resp) => {
        const html = resp.data;
        const { document } = (new JSDOM(html)).window;
        const table = document.querySelectorAll("table")[0];
        const columns = table.querySelectorAll("thead th");
        let columnNames = [];
        columns.forEach((column) => {
          columnNames.push(column.textContent);
        });

        const rows = [];
        table.querySelectorAll("tbody > tr").forEach((trNode) => {
          const tdNodes = trNode.querySelectorAll("td");
          const dataRow = {};
          for(let i=0; i<columnNames.length; i++) {
            dataRow[columnNames[i]] = tdNodes[i].textContent;
          };
          rows.push(dataRow);
        });
        resolve(rows);
      })
      .catch((err) => {
        console.log("Error");
        console.log(err);
        reject(err.message);
      });
      // -- 
    });
  });
}

function sql(statement) {
  return executeSQL(statement);
}

module.exports = {
  sql
}