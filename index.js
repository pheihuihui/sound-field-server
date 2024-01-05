import { SerialPort } from "serialport";
import { ByteLengthParser } from '@serialport/parser-byte-length'
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const message = { data: "" };

const port = new SerialPort({
    path: "COM3",
    baudRate: 115200,
});

const parser = port.pipe(new ByteLengthParser({ length: 256 }))

parser.on('data', data => {
    console.log(data)
    message.data = data
})

wss.on("connection", function connection(ws) {
    setInterval(() => {
        ws.send(message.data)
    }, 100);
});
