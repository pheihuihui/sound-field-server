from Maix import MIC_ARRAY as mic
import time
from fpioa_manager import fm
from machine import UART

fm.register(5, fm.fpioa.UART1_TX, force=True)
fm.register(4, fm.fpioa.UART1_RX, force=True)

uart = UART(UART.UART1, 115200, 8, None, 1, timeout=1000, read_buf_len=1024)

mic.init()
def get_mic_dir():
    imga = mic.get_map()
    b = mic.get_dir(imga)
    mic.set_led(b, (1, 1, 1))
    img_bytes = imga.to_bytes()
    uart.write(img_bytes)
    uart.write(b'\x01\x02\x03\x04')
while True:
    get_mic_dir()
    # time.sleep(0.01)
mic.deinit()
