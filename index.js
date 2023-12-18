import { SerialPort } from "serialport";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const message = { data: "" };

const port = new SerialPort({
    path: "COM3",
    baudRate: 115200
});

port.on('data', data => {
    console.log(data)
    port.flush()
})

wss.on("connection", function connection(ws) {
    ws.on("error", console.error);
    ws.send(message.data);
});
