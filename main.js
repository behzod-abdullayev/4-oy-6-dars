const http = require("http");
const opt = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};
const { read_file, write_file } = require("./manage.js/managing");
const bcrypt = require("bcryptjs");
const { v4 } = require("uuid");
const jwt = require("jsonwebtoken");

const app = http.createServer((req, res) => {
  //                                                   authentication
  // register
  if (req.method === "POST" && req.url === "/register") {
    req.on("data", async (chunk) => {
      const data = JSON.parse(chunk);
      const { username, email, password } = data;

      if (!username || !email || !password) {
        res.writeHead(400, opt);
        return res.end(
          JSON.stringify({
            message: "username, password and email required",
          })
        );
      }

      const user = read_file("auth.json");
      const foundUser = user.find((item) => item.email === email);

      if (foundUser) {
        res.writeHead(400, opt);
        return res.end(
          JSON.stringify({
            message: "user already exist",
          })
        );
      }
      const hash = await bcrypt.hash(password, 12);

      user.push({
        id: v4(),
        username,
        email,
        password: hash,
      });
      write_file("auth.json", user);

      res.writeHead(201, opt);

      res.end(
        JSON.stringify({
          message: "registered",
        })
      );
    });
  }

  // login
  if (req.method === "POST" && req.url === "/login") {
    req.on("data", async (chunk) => {
      const data = JSON.parse(chunk);
      const { email, password } = data;

      if (!email || !password) {
        res.writeHead(400, opt);
        return res.end(
          JSON.stringify({
            message: "email and password are required",
          })
        );
      }
      const user = read_file("auth.json");
      const foundUser = user.find((user) => user.email === email);

      if (!foundUser) {
        res.writeHead(401, opt);
        return res.end(
          JSON.stringify({
            message: "user not found",
          })
        );
      }

      const decode = await bcrypt.compare(password, foundUser.password);

      if (decode) {
        const payload = {id: foundUser.id, username: foundUser.username}
        const acces_token = jwt.sign(payload, "salom", {expiresIn: "15m"})
        res.writeHead(200, opt)
        return res.end(JSON.stringify({
            messege: "logined succesfully",
            acces_token
        }))
      } else {
        res.writeHead(400, opt);
        return res.end(
          JSON.stringify({
            message: "wrong password",
          })
        );
      }
    });
  }
});

app.listen(3000, () => {
  console.log("server is running");
});
