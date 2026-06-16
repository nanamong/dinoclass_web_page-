import urllib.request
import zipfile
import io

url = "https://prod.spline.design/bat8fGdR4ZwCMV82/scene.splinecode"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    data = response.read()

try:
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        print("Zip contents:", z.namelist())
        for name in z.namelist():
            if name.endswith('.json') or name == 'scene.json':
                content = z.read(name).decode('utf-8', errors='ignore')
                if 'favorite human' in content:
                    print("Found text in", name)
except zipfile.BadZipFile:
    print("Not a zip file. Checking raw bytes for text...")
    if b'favorite human' in data:
        print("Found text in raw binary!")
        
