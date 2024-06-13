#!/bin/bash

# Navigate to the project directory
cd /home/pi/pictureframe

# Run the npm start command
npm run start

# Get the IP address
#IP_ADDRESS=$(hostname -I | awk '{print $1}')

# Show a desktop notification for 10 seconds (10000 milliseconds)
#DISPLAY=:0.0 /usr/bin/notify-send -t 10000 "Raspberry Pi IP Address" "$IP_ADDRESS"
