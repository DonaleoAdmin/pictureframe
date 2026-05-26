# !/bin/python
import time
import os

print("Slideshow is running soon...")
time.sleep(10)
os.system("find /home/pi/Pictures \( -path /home/pi/Pictures/'Exclusive Photos' \) -prune -o -type f -name '*.jpg' -print | feh -Z -F -B black -z -r -x -Y -q -D 7 -f -")

while 1:
  time.sleep(1)