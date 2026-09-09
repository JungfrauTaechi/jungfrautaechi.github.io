"""Recover original tour cube tiles and generate Pannellum's local tile pyramid.

Usage: python scripts/recover-panorama-resolution.py --xml ../audit/pascal-2026-09-09/tour-source.xml
Requires Pillow and requests. Original downloads are cached outside public/ for repeatability.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json
import math
from pathlib import Path
import time
import threading
import requests
import xml.etree.ElementTree as ET
from PIL import Image

SCENES = dict(zip(
    ['pano1777','pano20804','pano20789','pano20989','pano20642','pano20641','pano20344','pano20643','pano6666','pano11658','pano12421','pano21159','pano20982'],
    ['first','waldspitz','maennlichen','muerren','grund','bodmi','stechelberg','lauterbrunnen','airtime-west','airtime-ost','airtime-winter','airtime-max','airtime-stechelberg']))
SOURCE = 'https://jungfrau-taechi.ch/sites/dcjt360_bootstrapdata/'

def recover(xml, cache, output):
    manifest = {}
    cache.mkdir(parents=True, exist_ok=True)
    sessions = threading.local()
    def download(relative):
        file = cache / relative
        if file.is_file():
            return file
        for attempt in range(4):
            try:
                if not hasattr(sessions, 'http'):
                    sessions.http = requests.Session()
                response = sessions.http.get(SOURCE + relative, timeout=(15, 30))
                response.raise_for_status()
                data = response.content
                with Image.open(BytesIO(data)) as im:
                    im.verify()
                file.parent.mkdir(parents=True, exist_ok=True)
                file.write_bytes(data)
                return file
            except Exception as error:
                if attempt == 3:
                    raise RuntimeError(f'Could not recover {relative}: {error}') from error
                time.sleep(attempt + 1)

    with ThreadPoolExecutor(max_workers=6) as pool:
        for scene in ET.parse(xml).getroot().findall('scene'):
            scene_id = SCENES.get(scene.get('name'))
            if not scene_id:
                continue
            view = scene.find('view')
            source_image = scene.find('image')
            level = max(source_image.findall('level'), key=lambda item: int(item.get('tiledimagewidth')))
            resolution = int(level.get('tiledimagewidth'))
            source_tile = int(source_image.get('tilesize'))
            max_level = math.ceil(math.log2(resolution / 512)) + 1
            dest = output / scene_id / 'multires'
            for face_name, face_id in [('front','f'),('right','r'),('back','b'),('left','l'),('up','u'),('down','d')]:
                marker = cache / f'{scene_id}-{face_id}-{resolution}-q78.complete'
                if marker.exists() and (dest / '1' / f'{face_id}_0_0.jpg').exists():
                    continue
                count = math.ceil(resolution / source_tile)
                template = level.find(face_name).get('url')
                coords = [(x,y) for y in range(count) for x in range(count)]
                paths = list(pool.map(download, [template.replace('%v',str(y)).replace('%u',str(x)) for x,y in coords]))
                full = Image.new('RGB', (resolution,resolution))
                for (x,y), file in zip(coords, paths):
                    with Image.open(file) as tile:
                        expected = (min(source_tile,resolution-x*source_tile), min(source_tile,resolution-y*source_tile))
                        if tile.size != expected:
                            raise ValueError(f'Unexpected source tile size {file}: {tile.size}, expected {expected}')
                        full.paste(tile,(x*source_tile,y*source_tile))
                for zoom in range(1,max_level+1):
                    size = math.ceil(resolution / 2**(max_level-zoom))
                    scaled = full if size == resolution else full.resize((size,size),Image.Resampling.LANCZOS)
                    folder = dest / str(zoom)
                    folder.mkdir(parents=True,exist_ok=True)
                    for y in range(math.ceil(size/512)):
                        for x in range(math.ceil(size/512)):
                            scaled.crop((x*512,y*512,min((x+1)*512,size),min((y+1)*512,size))).save(folder/f'{face_id}_{y}_{x}.jpg',quality=78,optimize=True)
                    if scaled is not full:
                        scaled.close()
                full.close()
                marker.touch()
                print(f'{scene_id}: recovered {face_name} at {resolution}px',flush=True)
            manifest[scene_id] = {
                'sourceScene': scene.get('name'), 'sourceUrl': SOURCE,
                'minPitch': -float(view.get('vlookatmax')), 'maxPitch': -float(view.get('vlookatmin')),
                'multiRes': {'path':'%l/%s_%y_%x','extension':'jpg','tileResolution':512,'maxLevel':max_level,'cubeResolution':resolution},
            }
            print(f'{scene_id}: complete',flush=True)
    if set(manifest) != set(SCENES.values()):
        raise ValueError('Not all 13 scenes were recovered')
    (output / 'multires-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--xml',required=True,type=Path)
    parser.add_argument('--cache',type=Path,default=Path('../audit/pascal-2026-09-09/original-tiles'))
    parser.add_argument('--output',type=Path,default=Path('public/assets/panoramas'))
    args = parser.parse_args()
    recover(args.xml,args.cache,args.output)
