from pathlib import Path
from urllib.request import urlretrieve

assets = Path(__file__).resolve().parents[1] / 'public' / 'assets'
images = {
    'careers-hero.jpg': '11062b_96a9ca8bef854a62937dbb4a2e620775~mv2.jpg',
    'careers-hiring.png': '8bda10_5af58aaf17084a039133527c42cf5051~mv2.png',
}

for filename, source in images.items():
    urlretrieve(f'https://static.wixstatic.com/media/{source}', assets / filename)
    print(filename)
