from pathlib import Path
from urllib.request import urlretrieve

assets = Path(__file__).resolve().parents[1] / 'public' / 'assets'
images = {
    'promos-hero.jpg': '11062b_49be44cfc78248dbb6c3fcc3eafe468d~mv2.jpg',
    'promo-coverage.png': '8bda10_771400d6b0464c20a3f97f42d2ee4d55~mv2.png',
    'promo-seniors.png': '8bda10_31a60ce16d824da6b52ad8bdcba9a5f7~mv2.png',
    'promo-first-visit.png': '8bda10_c3d217e396ea485da943c7f318270268~mv2.png',
}

for filename, source in images.items():
    urlretrieve(f'https://static.wixstatic.com/media/{source}', assets / filename)
    print(filename)
