# !/bin/python
import time
import os

print("Slideshow is running soon...")
time.sleep(10)
os.system("feh -Z -F -B black -z -r -x -Y -q -D 7 /home/pi/Pictures")

while 1:
  time.sleep(1)