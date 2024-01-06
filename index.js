import { SerialPort } from "serialport";
import { DelimiterParser } from '@serialport/parser-delimiter'
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const message = { data: "" };

const port = new SerialPort({
    path: "COM3",
    baudRate: 115200,
});

// const parser = port.pipe(new ByteLengthParser({ length: 256 }))
const parser = port.pipe(new DelimiterParser({ delimiter: Buffer.from(new Uint8Array([1, 2, 3, 4])) }))

parser.on('data', data => {
    console.log(data)
    message.data = data
})

wss.on("connection", function connection(ws) {
    setInterval(() => {
        ws.send(message.data)
    }, 100);
});
