const http = require("http");
const opt = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};
const { read_file, write_file } = require("./manage.js/managing");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const app = http.createServer((req, res) => {
  const reqId = req.url.split("/").pop()
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
        const payload = { id: foundUser.id, username: foundUser.username };
        const acces_token = jwt.sign(payload, "salom", { expiresIn: "15m" });
        res.writeHead(200, opt);
        return res.end(
          JSON.stringify({
            messege: "logined succesfully",
            acces_token,
          })
        );
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

  //                                                   ishchilar

  //get

  if (req.method === "GET" && req.url === "/get_all_ishchilar") {
    try {
      const fileData = read_file("ishchilar.json");
      res.writeHead(200, opt);
      res.end(JSON.stringify(fileData));
    } catch (error) {
      res.writeHead(500, opt);
      res.end(
        JSON.stringify({
          message: "error massage",
        })
      );
    }
  }

  // GETONE
  if (req.method === "GET" && req.url === `/get_one_ishchi/${reqId}`) {
    try {
      const fileData = read_file("ishchilar.json");
      const foundishchi = fileData.find((ishchi) => ishchi.id === reqId);
      if (!foundishchi) {
        res.writeHead(404, opt);
        return res.end(
          JSON.stringify({
            message: "ishchi not found",
          })
        );
      }
      res.writeHead(200, opt);
      res.end(JSON.stringify(foundishchi));
    } catch (error) {
      res.writeHead(500, opt);
      res.end(
        JSON.stringify({
          message: "error massage",
        })
      );
    }
  }

  //post
  if (req.method === "POST" && req.url === "/add_ishchi") {
    req.on("data", (lion) => {
      try {
        const data = JSON.parse(lion);
        const { name, surname, age, specialty, experience } = data;
        const fileData = read_file("ishchilar.json");
        fileData.push({
          id: uuid.v4(),
          name,
          surname,
          age,
          specialty,
          experience,
        });

        write_file("ishchilar.json", fileData);
        res.writeHead(201, opt);
        res.end(
          JSON.stringify({
            message: "added new ishchi",
          })
        );
      } catch (error) {
        res.writeHead(500, opt);
        res.end(
          JSON.stringify({
            message: "error massage",
          })
        );
      }
    });
  }

  //put
  if (req.method === "PUT" && req.url === `/update_ishchi/${reqId}`) {
    req.on("data", (lion) => {
      try {
        const data = JSON.parse(lion);
        const { name, surname, age, specialty, experience } = data;
        const fileData = read_file("ishchilar.json");
        const foundishchi = fileData.find((ishchi) => ishchi.id === reqId);
        if (!foundishchi) {
          res.writeHead(404, opt);
          return res.end(
            JSON.stringify({
              message: "ishchi not found",
            })
          );
        }
        fileData.forEach((ishchi) => {
          if (ishchi.id === reqId) {
            ishchi.name = name ? name : ishchi.name;
            ishchi.surname = surname ? surname : ishchi.surname;
            ishchi.age = age ? age : ishchi.age;
            ishchi.specialty = specialty ? specialty : ishchi.specialty;
            ishchi.experience = experience ? experience : ishchi.experience;
          }
        });
        write_file("ishchilar.json", fileData);
        res.writeHead(200, opt);
        res.end(
          JSON.stringify({
            message: "updated ishchi",
          })
        );
      } catch (error) {
        res.writeHead(500, opt);
        res.end(
          JSON.stringify({
            message: "error massage",
          })
        );
      }
    });
  }

  //delete
  if (req.method === "DELETE" && req.url === `/delete_ishchi/${reqId}`) {
    try {
      const fileData = read_file("ishchilar.json");
      const foundishchi = fileData.find((ishchi) => ishchi.id === reqId);
      if (!foundishchi) {
        res.writeHead(404, opt);
        return res.end(
          JSON.stringify({
            message: "ishchi not found",
          })
        );
      }

      fileData.forEach((ishchi, index) => {
        if (ishchi.id === reqId) {
          fileData.splice(index, 1);
        }
      });

      write_file("ishchilar.json", fileData);
      res.writeHead(200, opt);
      return res.end(
        JSON.stringify({
          message: "deleted ishchi",
        })
      );
    } catch (error) {
      res.writeHead(500, opt);
      res.end(
        JSON.stringify({
          message: "error massage",
        })
      );
    }
  }
});

app.listen(3000, () => {
  console.log("server is running");
});
