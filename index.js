const SerialPort = require("serialport").SerialPort
const DelimiterParser = require("@serialport/parser-delimiter").DelimiterParser
const WebSocketServer = require("ws").Server
const { writeFileSync, readdirSync } = require("fs")
const express = require("express")
const cors = require("cors")

const WSS = new WebSocketServer({ port: 8080 })
const MESSAGE = { data: "" }
const E_PORT = 3000
const GAP = 1000 * 60 * 60

let arr = []
let time = Date.now()

const S_PORT = new SerialPort({
    path: "COM3",
    baudRate: 115200,
})

const parser = S_PORT.pipe(new DelimiterParser({ delimiter: Buffer.from(new Uint8Array([1, 2, 3, 4])) }))

parser.on("data", (data) => {
    if (!data.length) {
        return
    }
    if (data.length != 256) {
        return
    }
    MESSAGE.data = data
    let now = Date.now()
    if (now - time <= GAP) {
        arr.push({
            time: now,
            data: data,
        })
    } else {
        let buffers = arr.map((item) => {
            let arr1 = Array(10).fill(0)
            let buff1 = Buffer.from(new Uint8Array(arr1))
            let arr2 = bignum2arr(item.time)
            let buff2 = Buffer.from(new Uint8Array(arr2))
            let buff3 = Buffer.from(item.data)
            return Buffer.concat([buff1, buff2, buff3], 256 + 10 + 6)
        })
        let buffer = Buffer.concat(buffers)
        writeFileSync(`${__dirname}/data/${time}.sound`, buffer, (err) => {
            console.log(err)
        })

        time = now
        arr = []

        arr.push({
            time: now,
            data: data,
        })
    }
})

WSS.on("connection", function connection(ws) {
    setInterval(() => {
        ws.send(MESSAGE.data)
    }, 100)
})

// prettier-ignore
const bignum2arr = (num) => {
    let bg = BigInt(num)
    return [
        (bg >> 40n) & 255n,
        (bg >> 32n) & 255n,
        (bg >> 24n) & 255n,
        (bg >> 16n) & 255n,
        (bg >> 8n) & 255n,
        bg & 255n
    ].map((v) => Number(v))
}

const app = express()

function getAllSounds() {
    let files = readdirSync("./data")
    let sounds = files.filter((item) => item.endsWith(".sound"))
    return sounds
}

app.use(cors())

app.get("/sounds", (req, res) => {
    res.json(getAllSounds())
})

app.get("/gap", (req, res) => {
    res.json(GAP)
})

app.get("/sound/:name", (req, res) => {
    res.sendFile(`${__dirname}/data/${req.params.name}.sound`, (err) => {
        console.log(err)
    })
})

app.listen(E_PORT)
