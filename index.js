import { SerialPort } from "serialport";
import { DelimiterParser } from '@serialport/parser-delimiter'
import { WebSocketServer } from "ws";
import { writeFileSync } from 'fs'

const wss = new WebSocketServer({ port: 8080 });
const message = { data: "" };
let arr = [];
let time = Date.now();
const gap = 10000

const port = new SerialPort({
    path: "COM3",
    baudRate: 115200,
});

const parser = port.pipe(new DelimiterParser({ delimiter: Buffer.from(new Uint8Array([1, 2, 3, 4])) }))

parser.on('data', data => {
    console.log(data)
    message.data = data
    let now = Date.now()
    if (now - time <= gap) {
        if (data.length == 256) {
            arr.push({
                time: now,
                data: data
            })
        }
    } else {
        let buffers = arr.map(item => {
            let arr1 = Array(10).fill(0)
            let buff1 = Buffer.from(new Uint8Array(arr1))
            let arr2 = conv(item.time)
            let buff2 = Buffer.from(new Uint8Array(arr2))
            let buff3 = Buffer.from(item.data)
            return Buffer.concat([buff1, buff2, buff3], 256 + 10 + 6)
        })
        let buffer = Buffer.concat(buffers)
        writeFileSync(`./data/${time}.sound`, buffer, (err) => {
            console.log(err);
        });

        time = now
        arr = []
        if (data.length == 256) {
            arr.push({
                time: now,
                data: data
            })
        }
    }
})

wss.on("connection", function connection(ws) {
    setInterval(() => {
        ws.send(message.data)
    }, 100);
});

const conv = num => {
    let bg = BigInt(num)
    return [
        (bg >> 40n) & 255n,
        (bg >> 32n) & 255n,
        (bg >> 24n) & 255n,
        (bg >> 16n) & 255n,
        (bg >> 8n) & 255n,
        bg & 255n,
    ].map(v => Number(v))
}