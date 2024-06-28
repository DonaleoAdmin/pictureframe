#!/bin/bash

# Remove Nginx service and components
echo "Removing Nginx service and components..."
sudo systemctl stop nginx

# Purge Nginx:
echo "Purging Nginx..."
sudo apt purge nginx nginx-common nginx-full

# Remove Nginx Directories:
echo "Removing Nginx Directories..."
sudo rm -rf /etc/nginx
sudo rm -rf /var/www/html
sudo rm -rf /var/log/nginx
sudo rm -rf /var/cache/nginx

# Autoremove Unused Packages:
echo "Autoremoving Unused Packages..."
sudo apt autoremove

# Remove NodeJS
echo "Removing NodeJS"
sudo rm -r node_modules
sudo rm package.json
sudo rm package-lock.json
sudo rm slideshow.py
sudo apt remove nodejs -y

# Remove PictureFrame app and services
echo "Removing PictureFrame app and services..."
sudo rm -r pictureframe

# Remove xcreensaver
echo "Removing xcreensaver..."
sudo apt remove xscreensaver -y

# Remove feh
echo "Removing feh..."
pkill feh
sudo apt remove feh -y

# Remove entries in the wayfire.ini
# Remove existing [autostart] section if it exists
echo "Removing entries in the wayfire.ini..."
sudo sed -i '/^\[autostart\]/,/^$/d' ~/.config/wayfire.ini

echo "Uninstallation of the PictureFrame app and related componments have been completed."
echo "The system will reboot now!"
sudo reboot