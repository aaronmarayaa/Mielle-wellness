from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'assets'
BASE = 'https://static.wixstatic.com/media/'
# Original gallery photographs from https://www.miellewellness.ca/treatments.
ASSETS = {
    'service-relaxation.jpg': ('75d695884a504e7e9eb65363c40ab906.jpg', 'fp_0.59_0.4'),
    'service-deep-tissue.jpg': ('11062b_bf94b53fa4454fe79925445bad9b33b9~mv2.jpg', 'al_c'),
    'service-cupping.jpg': ('11062b_50823653f9bb4794a1410e88fff3b6c6~mv2.jpg', 'al_c'),
    'service-hot-stone.jpg': ('11062b_39cdc1ff55744ce9871339e74b39a362~mv2.jpg', 'al_c'),
    'service-youth.jpg': ('8bda10_be65966cee5c42efa32887d2cf2e606f~mv2.jpg', 'al_c'),
    'service-prenatal.jpg': ('11062b_b796cd6582464cb28e2cbefc5a716f1e~mv2.jpg', 'al_c'),
    'service-thai.jpg': ('11062b_a53029a4b73441e7bf555608a12827b6~mv2.jpeg', 'fp_0.57_0.37'),
    'service-lymphatic.jpg': ('8bda10_d173e6f507f24a8d891b411e9c0626c3~mv2.jpg', 'al_c'),
}


def download(item):
    name, (source, crop) = item
    target = ROOT / name
    if target.exists():
        return
    with urlopen(f'{BASE}{source}/v1/fill/w_640,h_640,{crop},q_90/{name}', timeout=45) as response:
        target.write_bytes(response.read())
    print(name, target.stat().st_size)


if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(download, ASSETS.items()))
