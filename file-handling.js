const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.end(
      `
        <form action="/message" method="POST">
          <label>Name: </label>
          <input type="text" name="username" required></input>
          <button type='submit'>Add</button>
        </form>
      `
    );
  } else if (url === "/message" && method === "POST") {
    const dataChunks = [];
    req.on("data", (chunk) => {
      dataChunks.push(chunk);
    });

    req.on("end", () => {
      const parsedData = Buffer.concat(dataChunks).toString();
      const username = new URLSearchParams(parsedData).get("username");

      // Write the data to a file
      fs.writeFile("user-data.txt", username, (err) => {
        if (err) {
          console.error("Error writing to file", err);
          res.statusCode = 500;
          res.end("Error saving data.");
          return;
        }

        // Redirect to /read
        res.statusCode = 302;
        res.setHeader("Location", "/read");
        res.end();
      });
    });
  } else if (url === "/read") {
    fs.readFile("user-data.txt", "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading file", err);
        res.statusCode = 500;
        res.end("Error reading data.");
        return;
      }

      res.setHeader("Content-Type", "text/html");
      res.end(`<h1>Stored Data: ${data}</h1>`);
    });
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>Page Not Found</h1>");
  }
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
