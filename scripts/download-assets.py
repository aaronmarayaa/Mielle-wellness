from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'assets'
ROOT.mkdir(parents=True, exist_ok=True)
BASE = 'https://static.wixstatic.com/media/'
ASSETS = {
    'hero.jpg': '11062b_62dddabc4f6848bda6b0567f88d6b260~mv2.jpg',
    'logo-mark.png': 'fa81de_909b6234eb7a43f6845f5e90577d9170~mv2.png/v1/crop/x_0,y_479,w_2431,h_2029/fill/w_280,h_234,al_c,q_95/logo.png',
    'logo-full.png': 'fa81de_909b6234eb7a43f6845f5e90577d9170~mv2.png/v1/crop/x_0,y_522,w_2550,h_2303/fill/w_600,h_542,al_c,q_95/logo.png',
    'mobile-massage.jpg': '11062b_91ccbd27bba94d56b7672e471d28b40f~mv2.jpg',
    'clinic.jpg': '11062b_63f82f4b30c94e41bf55e8d839342aea~mv2.jpg',
    'massage.jpg': 'nsplsh_81195f4c7ab54054ae4f6d272bc13462~mv2.jpg',
    'cupping.jpg': '11062b_50823653f9bb4794a1410e88fff3b6c6~mv2.jpg',
    'relaxation.jpg': '75d695884a504e7e9eb65363c40ab906.jpg',
    'laser.jpg': '8bda10_d4feb68d299e45d18bb52683e95524bc~mv2.jpg',
    'about.png': 'fa81de_11d09664165f448db2c100c0e83d668a~mv2.png/v1/crop/x_0,y_50,w_1720,h_1876/fill/w_900,h_982,al_c,q_90/about.png',
    'interior.jpg': '11062b_9ca991ae9bdb4c3b81a44a38987fc5e5~mv2.jpg',
    'detail-reception.jpg': 'c837a6_a022f60aed3442a1b60e41a9e1f99f88~mv2.jpg',
    'detail-facial.jpg': 'c837a6_1e30e0b341ff4f2cb6b2b40a459ec9d7f000.jpg',
    'detail-leaves.jpg': 'c837a6_de3b1dd59b9743028b404244eee41345f000.jpg',
    'map.png': '8bda10_82c2eb884f9c498e9f320a91de196cc6~mv2.png',
}
INSURERS = [
    '8bda10_7a888949bb5641a481bf0fcd53d724bc~mv2.png',
    '8bda10_24bbf080323d4f0c93480980566651b7~mv2.webp',
    '8bda10_3df971029cd741ef80427bd8b440d8ad~mv2.png',
    '8bda10_5ee5497c138344a6a9054541ffd3c1ae~mv2.jpg',
    '8bda10_fd0134a287194963ad44cc93e250dbeb~mv2.png',
    '8bda10_653b4c9f7f194c6580f96b3818e939c3~mv2.webp',
    '8bda10_f7c8ae955cbf45de92feef42dc6b6641~mv2.png',
    '8bda10_fd8feb8d64724e87acd04d425e4aeb71~mv2.jpeg',
    '8bda10_a500c2a43bc54c58a00f0b3e34793e8c~mv2.png',
    '8bda10_59b7462a3c074b85b12ece33d64bc606~mv2.png',
    '8bda10_9e50d7b8a20a4fc3b9471d3231e230ad~mv2.png',
    '8bda10_cf4bb498219b4859a6dc96b6d39b4fa9~mv2.png',
    '8bda10_625ed881cbea43e7b162672b538092d1~mv2.png',
    '8bda10_e6792dd7c0d1450e8e36ce0d8f404ec6~mv2.png',
    '8bda10_93089eefbb1b4e198e29da5d94d36d98~mv2.png',
    '8bda10_3faa522eb85d4c379a4a5b170f4603f1~mv2.png',
    '8bda10_ca97bddd534d452584de92cfb511367b~mv2.webp',
    '8bda10_99b1d2e289a746c28bf4ed5e5d70c643~mv2.png',
    '8bda10_b968617c301e4a5499955da34ee60af4~mv2.png',
    '8bda10_a5f62a322d9d47418ddcad04a14034d9~mv2.png',
    '8bda10_491b07b5038c4516aa88593d5cd8a76d~mv2.png',
    '8bda10_d12a022ccd1a4ce8844b52fbfa8a3d5e~mv2.jpg',
    '8bda10_d4c24fc38dc3498b928c2345f81fca0e~mv2.png',
    '8bda10_5f380ccd37f942ed9e1fe670769c5e5e~mv2.png',
    '8bda10_cd6b41a7c8c047aabaaef500f4763242~mv2.png',
]
for i, asset in enumerate(INSURERS):
    ASSETS[f'insurer-{i}{Path(asset).suffix}'] = asset
ASSETS.update({
    'insurer-pbas.png': 'https://www.pbas.ca/sites/default/files/pbas_group_logo_consolidated.png',
    'insurer-manitoba.svg': 'https://cdn.prod.website-files.com/6019e69578fc134772edadda/605b2040a0fd9df9f699920f_logo-full.svg',
    'insurer-desjardins.svg': 'https://www.desjardins.com/en/about-us/who-we-are/logo-history/_jcr_content/root/container/container/container_1929039103/container_copy_copy__129010021/image.coreimg.svg/1773778300793/logo-desjardins-vert.svg',
    'insurer-ssq.gif': 'https://www.providerconnect.ca/Carriers/SSQ/SSQ_logo.gif',
    'insurer-empire.png': 'https://www.providerconnect.ca/Carriers/EmpireLife/EL_logo.png',
    'insurer-gsc.png': 'https://www.genxys.com/wp-content/uploads/2020/07/green-shield-canada-insurance-logo-clip-art-brand-5bfb3b613e7755.7959512915431913932559.png',
    'insurer-claimsecure.png': 'https://www.claimsecure.com/wp-content/uploads/2026/02/ClaimSecure-logo-EN.png',
})
ASSETS['avenir.woff2'] = 'https://static.parastorage.com/fonts/v2/af36905f-3c92-4ef9-b0c1-f91432f16ac1/v1/avenir-lt-w01_35-light1475496.woff2'
ASSETS['fraunces.woff2'] = 'https://static.parastorage.com/fonts/v2/7044e9d5-fe6a-465f-aef8-162a1e9d621f/v1/fraunces_120pt-light.woff2'
ASSETS['fraunces-italic.woff2'] = 'https://static.parastorage.com/fonts/v2/95ea2f83-2652-4184-9e28-eb415df1ce37/v1/fraunces_120pt-light.woff2'

def download(item):
    name, source = item
    url = source if source.startswith('https:') else BASE + source
    target = ROOT / name
    if target.exists():
        return
    with urllib.request.urlopen(url, timeout=45) as response:
        target.write_bytes(response.read())
    print(name, target.stat().st_size)

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=8) as executor:
        list(executor.map(download, ASSETS.items()))
