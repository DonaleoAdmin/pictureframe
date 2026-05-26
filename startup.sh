#!/bin/bash

# Wait for Wayfire desktop to load
#sleep 15

# Log everything for debugging purposes
exec > /home/pi/pictureframe/startup.log 2>&1

echo "Starting script running..."

# Make scripts executable
chmod +x /home/pi/pictureframe/*.sh
chmod +x /home/pi/pictureframe/*.py

# Run shell script
/home/pi/pictureframe/pictureframe.sh &

# Small delay to ensure the web server starts before the slideshow
sleep 2

# Run Python script
python3 /home/pi/pictureframe/slideshow.py &

echo "Startup completed!"
