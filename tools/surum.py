#!/usr/bin/env python3
"""Web sürümünü artırır ve dosya listesini günceller.
Kullanım: python3 tools/surum.py "Yenilik notu"
"""
import json, os, sys, datetime
root = os.path.join(os.path.dirname(__file__), '..', 'web')
vp = os.path.join(root, 'version.json')
cur = json.load(open(vp)) if os.path.exists(vp) else {"version": 0}
files = []
for d, _, fs in os.walk(root):
    for f in fs:
        rel = os.path.relpath(os.path.join(d, f), root).replace(os.sep, '/')
        if rel != 'version.json':
            files.append(rel)
files.sort()
v = {"version": cur.get("version", 0) + 1,
     "date": datetime.datetime.now().strftime('%d.%m.%Y'),
     "notes": sys.argv[1] if len(sys.argv) > 1 else "",
     "files": files}
json.dump(v, open(vp, 'w'), ensure_ascii=False, indent=1)
print("sürüm", v["version"], len(files), "dosya")
