from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'assets'
BASE = 'https://static.wixstatic.com/media/'
ASSETS = {
    'about-portrait.png': 'fa81de_11d09664165f448db2c100c0e83d668a~mv2.png/v1/crop/x_7,y_0,w_1713,h_2048/fill/w_720,h_861,al_c,q_90/about.png',
    'team-michelle.jpg': '8bda10_400ca38d2301465f8b13924c14d594b8~mv2.jpeg/v1/fill/w_600,h_692,al_c,q_90/michelle.jpeg',
    'team-ramin.jpg': '8bda10_eb05939def644ab4812d60e7e2c68625~mv2.jpg/v1/crop/x_548,y_0,w_1183,h_1365/fill/w_600,h_692,al_c,q_90/ramin.jpg',
    'team-tiegsti.jpg': '8bda10_ab88832074e34826b15566b7f5aba64c~mv2.jpeg/v1/crop/x_0,y_0,w_1320,h_1523/fill/w_600,h_692,al_c,q_90/tiegsti.jpeg',
    'team-kalena.jpg': '8bda10_63215f8f206642d39399cdbdea9b476f~mv2.jpeg/v1/crop/x_56,y_25,w_370,h_427/fill/w_600,h_692,al_c,q_90/kalena.jpeg',
    'team-raine.png': '8bda10_7ea81187d28c45ba9a66da297fdd0a57~mv2.png/v1/crop/x_341,y_298,w_521,h_601/fill/w_600,h_692,al_c,q_90/raine.png',
}


def download(item):
    name, source = item
    target = ROOT / name
    if target.exists():
        return
    with urlopen(BASE + source, timeout=45) as response:
        target.write_bytes(response.read())
    print(name, target.stat().st_size)


if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=6) as executor:
        list(executor.map(download, ASSETS.items()))
