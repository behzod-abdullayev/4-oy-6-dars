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
  const reqId = req.url.split("/").pop();
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
  //                                         richpeople

  //get
  if (req.method === "GET" && req.url === "/get_all_richpeople") {
    try {
      const fileData = read_file("richpeople.json");
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
  if (req.method === "GET" && req.url === `/get_one_richpeople/${reqId}`) {
    try {
      const fileData = read_file("richpeople.json");
      const foundrichpeople = fileData.find(
        (richpeople) => richpeople.id === reqId
      );
      if (!foundrichpeople) {
        res.writeHead(404, opt);
        return res.end(
          JSON.stringify({
            message: "richpeople not found",
          })
        );
      }
      res.writeHead(200, opt);
      res.end(JSON.stringify(foundrichpeople));
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
  if (req.method === "POST" && req.url === "/add_richpeople") {
    req.on("data", (lion) => {
      try {
        const data = JSON.parse(lion);
        const { fullname, age, owner, money, rank } = data;
        const fileData = read_file("richpeople.json");
        fileData.push({
          id: uuid.v4(),
          fullname,
          age,
          owner,
          money,
          rank,
        });

        write_file("richpeople.json", fileData);
        res.writeHead(201, opt);
        res.end(
          JSON.stringify({
            message: "added new richpeople",
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
  if (req.method === "PUT" && req.url === `/update_richpeople/${reqId}`) {
    req.on("data", (lion) => {
      try {
        const data = JSON.parse(lion);
        const { fullname, age, owner, money, rank } = data;
        const fileData = read_file("richpeople.json");
        const foundrichpeople = fileData.find(
          (richpeople) => richpeople.id === reqId
        );
        if (!foundrichpeople) {
          res.writeHead(404, opt);
          return res.end(
            JSON.stringify({
              message: "richpeople not found",
            })
          );
        }
        fileData.forEach((richpeople) => {
          if (richpeople.id === reqId) {
            richpeople.fullname = fullname ? fullname : richpeople.fullname;
            richpeople.age = age ? age : richpeople.age;
            richpeople.owner = owner ? owner : richpeople.owner;
            richpeople.money = money ? money : richpeople.money;
            richpeople.rank = rank ? rank : richpeople.rank;
          }
        });
        write_file("richpeople.json", fileData);
        res.writeHead(200, opt);
        res.end(
          JSON.stringify({
            message: "updated richpeople",
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
  if (req.method === "DELETE" && req.url === `/delete_richpeople/${reqId}`) {
    try {
      const fileData = read_file("richpeople.json");
      const foundrichpeople = fileData.find(
        (richpeople) => richpeople.id === reqId
      );
      if (!foundrichpeople) {
        res.writeHead(404, opt);
        return res.end(
          JSON.stringify({
            message: "richpeople not found",
          })
        );
      }

      fileData.forEach((richpeople, index) => {
        if (richpeople.id === reqId) {
          fileData.splice(index, 1);
        }
      });

      write_file("richpeople.json", fileData);
      res.writeHead(200, opt);
      return res.end(
        JSON.stringify({
          message: "deleted richpeople",
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

  //                                         footbal players of  UZBEKISTAN

  //get
  if (req.method === "GET" && req.url === "/get_all_uzbfootball") {
    try {
      const fileData = read_file("uzbfootball.json");
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
  if (req.method === "GET" && req.url === `/get_one_uzbfootball/${reqId}`) {
    try {
      const fileData = read_file("uzbfootball.json");
      const founduzbfootball = fileData.find(
        (uzbfootball) => uzbfootball.id === reqId
      );
      if (!founduzbfootball) {
        res.writeHead(404, opt);
        return res.end(
          JSON.stringify({
            message: "uzbfootball not found",
          })
        );
      }
      res.writeHead(200, opt);
      res.end(JSON.stringify(founduzbfootball));
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
  if (req.method === "POST" && req.url === "/add_uzbfootball") {
    req.on("data", (lion) => {
      try {
        const data = JSON.parse(lion);
        const { fullname, age, position, club, height } = data;
        const fileData = read_file("uzbfootball.json");
        fileData.push({
          id: uuid.v4(),
          fullname,
          age,
          position,
          club,
          height,
        });

        write_file("uzbfootball.json", fileData);
        res.writeHead(201, opt);
        res.end(
          JSON.stringify({
            message: "added new uzbfootball",
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
  if (req.method === "PUT" && req.url === `/update_uzbfootball/${reqId}`) {
    req.on("data", (lion) => {
      try {
        const data = JSON.parse(lion);
        const { fullname, age, position, club, height } = data;
        const fileData = read_file("uzbfootball.json");
        const founduzbfootball = fileData.find(
          (uzbfootball) => uzbfootball.id === reqId
        );
        if (!founduzbfootball) {
          res.writeHead(404, opt);
          return res.end(
            JSON.stringify({
              message: "uzbfootball not found",
            })
          );
        }
        fileData.forEach((uzbfootball) => {
          if (uzbfootball.id === reqId) {
            uzbfootball.fullname = fullname ? fullname : uzbfootball.fullname;
            uzbfootball.age = age ? age : uzbfootball.age;
            uzbfootball.position = position ? position : uzbfootball.position;
            uzbfootball.club = club ? club : uzbfootball.club;
            uzbfootball.height = height ? height : uzbfootball.height;
          }
        });
        write_file("uzbfootball.json", fileData);
        res.writeHead(200, opt);
        res.end(
          JSON.stringify({
            message: "updated uzbfootball",
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
  if (req.method === "DELETE" && req.url === `/delete_uzbfootball/${reqId}`) {
    try {
      const fileData = read_file("uzbfootball.json");
      const founduzbfootball = fileData.find(
        (uzbfootball) => uzbfootball.id === reqId
      );
      if (!founduzbfootball) {
        res.writeHead(404, opt);
        return res.end(
          JSON.stringify({
            message: "uzbfootball not found",
          })
        );
      }

      fileData.forEach((uzbfootball, index) => {
        if (uzbfootball.id === reqId) {
          fileData.splice(index, 1);
        }
      });

      write_file("uzbfootball.json", fileData);
      res.writeHead(200, opt);
      return res.end(
        JSON.stringify({
          message: "deleted uzbfootball",
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


    //                                        dorilar

  //get
  if (req.method === "GET" && req.url === "/get_all_dorilar") {
    try {
      const fileData = read_file("dorilar.json");
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
  if (req.method === "GET" && req.url === `/get_one_dori/${reqId}`) {
    try {
      const fileData = read_file("dorilar.json");
      const founddorilar = fileData.find(
        (dorilar) => dorilar.id === reqId
      );
      if (!founddorilar) {
        res.writeHead(404, opt);
        return res.end(
          JSON.stringify({
            message: "dorilar not found",
          })
        );
      }
      res.writeHead(200, opt);
      res.end(JSON.stringify(founddorilar));
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
  if (req.method === "POST" && req.url === "/add_dori") {
    req.on("data", (lion) => {
      try {
        const data = JSON.parse(lion);
        const { name, type, specialty } = data;
        const fileData = read_file("dorilar.json");
        fileData.push({
          id: uuid.v4(),
          name,
          type,
          specialty,
        });

        write_file("dorilar.json", fileData);
        res.writeHead(201, opt);
        res.end(
          JSON.stringify({
            message: "added new dorilar",
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
  if (req.method === "PUT" && req.url === `/update_dorilar/${reqId}`) {
    req.on("data", (lion) => {
      try {
        const data = JSON.parse(lion);
        const { name, type, specialty,} = data;
        const fileData = read_file("dorilar.json");
        const founddorilar = fileData.find(
          (dorilar) => dorilar.id === reqId
        );
        if (!founddorilar) {
          res.writeHead(404, opt);
          return res.end(
            JSON.stringify({
              message: "dorilar not found",
            })
          );
        }
        fileData.forEach((dorilar) => {
          if (dorilar.id === reqId) {
            dorilar.name = name ? name : dorilar.name;
            dorilar.type = type ? type : dorilar.type;
            dorilar.specialty = specialty ? specialty : dorilar.specialty;

          }
        });
        write_file("dorilar.json", fileData);
        res.writeHead(200, opt);
        res.end(
          JSON.stringify({
            message: "updated dorilar",
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
  if (req.method === "DELETE" && req.url === `/delete_dorilar/${reqId}`) {
    try {
      const fileData = read_file("dorilar.json");
      const founddorilar = fileData.find(
        (dorilar) => dorilar.id === reqId
      );
      if (!founddorilar) {
        res.writeHead(404, opt);
        return res.end(
          JSON.stringify({
            message: "dorilar not found",
          })
        );
      }

      fileData.forEach((dorilar, index) => {
        if (dorilar.id === reqId) {
          fileData.splice(index, 1);
        }
      });

      write_file("dorilar.json", fileData);
      res.writeHead(200, opt);
      return res.end(
        JSON.stringify({
          message: "deleted dorilar",
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
