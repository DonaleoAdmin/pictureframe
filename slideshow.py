# !/bin/python
import time
import os

print("Slideshow is running soon...")
time.sleep(10)
os.system("feh -F -B black -z -r -x -Y -q -D 7 C:/home/pi/Pictures")

while 1:
  time.sleep(1)