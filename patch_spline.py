import urllib.request

url = "https://prod.spline.design/bat8fGdR4ZwCMV82/scene.splinecode"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    data = response.read()

target = b"You are 100% my favorite human today"
new_text = "원하는 버튼을 눌러보세요.".encode('utf-8')

print("Target length:", len(target))
print("New text length:", len(new_text))

if len(new_text) < len(target):
    new_text = new_text + b' ' * (len(target) - len(new_text))
elif len(new_text) > len(target):
    print("WARNING: New text is longer than target! Flatbuffer might break.")

new_data = data.replace(target, new_text)

with open(r'd:\dev\dinoclass_web_page\public\scene.splinecode', 'wb') as f:
    f.write(new_data)
    
print("Successfully patched and saved to public/scene.splinecode")
