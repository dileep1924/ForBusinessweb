const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");
const { url } = require("inspector");
const app = express();
const razorpay = require("razorpay");

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("<h1>Hello World</h1>");
});

const RazorpayInstance = new razorpay({
  key_id: "rzp_test_ZExjyC66BFivru",
  key_secret: "KJflmXD6vQ4CWq2NiK4MPjn3",
});

app.post("/Location/track", async (req, res) => {
  try {
    let ip =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;

    if (!ip) {
      return res.status(500).json({ message: "Ip address not found" });
    }
    console.log("IP address is : ", ip);

    if (ip.includes(",")) {
      ip = ip.split(",")[0];
    }

    console.log("Cut Ip address", ip);

    if (ip === "::1" || ip.startsWith("127")) {
      ip = "171.79.32.81";
    }
    const options = {
      method: "GET",
      url: `http://ip-api.com/json/${ip}`,
      headers: {
        "Content-Type": "application/json",
      },
    };
    const ipresponse = await axios(options);
    const data = ipresponse.data;

    console.log("Check data ip address : ", data);

    if (data.status !== "success") {
      return res.status(401).json({ message: "Ip Address is not detected" });
    }

    const { lat, lon, regionName, city, zip, country } = data;

    const currentlocationOptions = {
      method: "GET",
      url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const locationdata = await axios(currentlocationOptions);
    const displayname = locationdata.data;

    res.status(200).json({
      message: "Successfull",
      state: regionName,
      city: city,
      pincode: zip,
      lat: lat,
      lon: lon,
      streetdata: displayname,
      country: country,
    });
  } catch (err) {
    console.log("Someething Error", err);
    res.status("402").json({ message: "Somthing error", error: err });
  }
});

app.get("/paymentstatus", async (req, res) => {
  try {
    const { payment_id } = req.body;
    console.log("Payment id",payment_id)
    const response = await razorpay.payments.fetchPaymentDetails(payment_id);
    res.status(200).json({ message: "details found", data: response });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "id not found" });
  }
});

app.listen(3000, () => {
  console.log(`Listen on Port no 3000`);
});
