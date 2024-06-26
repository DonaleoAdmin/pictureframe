# !/bin/python
import time
import os

print("Slideshow is running soon...")
time.sleep(10)
os.system("find E:/media \( -path E:/media/Europe -o -path E:/media/Collections \) -prune -o -type f -name '*.jpg' -print / feh -Z --auto-rotate -F -B black -z -r -x -Y -q -D 7")

while 1:
  time.sleep(1)