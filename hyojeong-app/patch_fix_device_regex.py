#!/usr/bin/env python3
"""Hotfix 3: word boundaries on DEVICE_WORDS so names like 'Jasmine' aren't eaten."""
import shutil, sys
path = "src/ZoomAttendance.jsx"
old = 'const DEVICE_WORDS = /(infinix|tecno|samsung|sm-?[a-z0-9]+|x\\d{3,}|kl\\d|redmi|xiaomi|oppo|vivo|realme|huawei|iphone|itel|cherry|nokia)/ig;'
new = 'const DEVICE_WORDS = /\\b(infinix|tecno|samsung|sm-?[a-z0-9]+|x\\d{3,}|kl\\d|redmi|xiaomi|oppo|vivo|realme|huawei|iphone|itel|cherry|nokia)\\b/ig;'
with open(path, "r", encoding="utf-8") as f:
    src = f.read()
n = src.count(old)
if n != 1:
    print(f"❌ anchor found {n} times (need 1). Aborting."); sys.exit(1)
shutil.copyfile(path, path + ".bak2")
src = src.replace(old, new)
with open(path, "w", encoding="utf-8") as f:
    f.write(src)
print("✅ src/ZoomAttendance.jsx: DEVICE_WORDS boundary fix applied (backup: .bak2)")
