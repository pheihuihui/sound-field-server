from Maix import MIC_ARRAY as mic
mic.init()
def get_mic_dir():
    imga = mic.get_map()
    b = mic.get_dir(imga)
    mic.set_led(b, (1, 1, 1))
    txt = ''
    for i in range(16):
        for j in range(16):
            tmp = imga.get_pixel((i, j))
            if (tmp == 0):
                txt += '0'
            else:
                txt += str(tmp) + ','
    print(txt)
while True:
    get_mic_dir()
mic.deinit()
