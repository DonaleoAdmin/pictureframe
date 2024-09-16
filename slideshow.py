# !/bin/python
import time
import os

print("Slideshow is running soon...")
time.sleep(10)
os.system("find C:/home/pi/Pictures \( -path C:/home/pi/Pictures/'Selections of 2024' \) -prune -o -type f -name '*.jpg' -print | feh -Z -F -B black -z -r -x -Y -q -D 7 -f -")

while 1:
  time.sleep(1)