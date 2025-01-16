const fs = require("fs");

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === "/") {
    // Read data from the file to display on the page
    fs.readFile("user-data.txt", "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading file", err);
        data = ""; // Default empty message if no file or error
      }

      res.setHeader("Content-Type", "text/html");
      res.end(
        `
          <h1>Stored Message: ${data || "No message yet!"}</h1>
          <form action="/message" method="POST">
            <label>Name: </label>
            <input type="text" name="username" required></input>
            <button type='submit'>Add</button>
          </form>
        `
      );
    });
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

        // Redirect back to "/" to display the updated message
        res.statusCode = 302;
        res.setHeader("Location", "/");
        res.end();
      });
    });
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>Page Not Found</h1>");
  }
};

module.exports = requestHandler;
