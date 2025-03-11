const express = require("express")
const cors = require("cors")
const { default: axios } = require("axios")
const { url } = require("inspector")
const app = express()

app.get("/", async (req, res) => {
    res.send("<h1>Hello World</h1>")
})

app.post("/Location/track", async (req, res) => {
    try {
        let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        if (!ip) {
            return res.status(500).json({ message: "Ip address not found" })
        }

        if (ip === "::1" || ip.startsWith("127")) {
            ip = "2401:4900:7b14:ee1a:9906:b1bc:359f:8873"
        }
        const options = {
            method: "GET",
            url: `http://ip-api.com/json/${ip}`,
            headers: {
                "Content-Type": "application/json"
            }
        }
        const ipresponse = await axios(options)
        const data = ipresponse.data

        if (data.status !== "success") {
            return res.status(401).json({ message: "Ip Address is not detected" })
        }

        const { lat, lon, regionName, city, zip } = data

        const currentlocationOptions = {
            method: "GET",
            url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            headers: {
                "Content-Type": "application/json"
            }
        }

        const locationdata = await axios(currentlocationOptions)
        const displayname = locationdata.data

        res.status(200).json({
            message: "Successfull",
            state: regionName,
            city: city,
            pincode: zip,
            lat: lat,
            lon: lon,
            streetdata: displayname
        })

    } catch (err) {
        console.log("Someething Error", err)
        res.status("402").json({ message: "Somthing error", error: err })
    }
})

app.listen(3000, () => {
    console.log(`Listen on Port no 3000`)
})