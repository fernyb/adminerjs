const axios = require("axios").default;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const FormData = require("form-data");

const url = "https://demo.adminer.org/adminer.php?username=&db=a264133_13fcqrod&sql=select%20*%20from%20songs%20limit%2050";

function executeSQL(statement) {
  const form = new FormData();
  form.append("query", statement);
  form.append("limit", "");
  form.append("token", "895700:573804");

  return new Promise((resolve) => {
    axios.create({
      headers: {
        ...form.getHeaders(),
        "Cookie": "adminer_permanent=; adminer_key=37392938842a244da90afc89a29a95f7; adminer_sid=ur6qlthh8dl0jujslta95hv048",
        "cache-control": "max-age=0",
        "Content-Length": form.getLengthSync(),
      },
    }).post(url, form).then((resp) => {
      const html = `${resp.data}`;
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
    });
  });
}

function sql(statement) {
  return executeSQL(statement);
}

module.exports = {
  sql
}