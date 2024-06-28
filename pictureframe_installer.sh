#!/bin/bash

# Update package list and upgrade installed packages
echo "Updating package list and upgrading installed packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install feh
sudo apt-get install feh

# Install xscreensaver
sudo apt-get install xscreensaver

# Install Node.js and npm
echo "Installing Node.js and npm..."
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs npm

# Clone the web application repository
echo "Cloning the web application repository..."
TARGET_DIR="pictureframe"
# cd /var/www
sudo git clone https://github.com/DonaleoAdmin/pictureframe.git "$TARGET_DIR"

# Get the current user
CURRENT_USER=$(whoami)

# Change the ownership of the cloned directory to the current user
sudo chown -R "$CURRENT_USER":"$CURRENT_USER" "$TARGET_DIR"

# Optionally, change permissions if necessary (e.g., make scripts executable)
# sudo chmod -R u+x "$TARGET_DIR"

echo "Repository cloned and ownership changed to $CURRENT_USER."

# Change to the web app directory
cd pictureframe

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

# Install Nodemon
echo "Installing Nodemon..."
npm install nodemon

# Edit wayfire.ini and append new lines
# Define the lines to be appended
new_lines="[autostart]
1 = sudo chmod +x ~/pictureframe/pictureframe.sh
2 = ~/pictureframe/pictureframe.sh
3 = python3 ~/pictureframe/slideshow.py"

# Remove existing [autostart] section if it exists
sudo sed -i '/^\[autostart\]/,/^$/d' ~/.config/wayfire.ini

# Append the new lines to wayfire.ini
echo "$new_lines" | sudo tee -a ~/.config/wayfire.ini > /dev/null

# Display a message indicating the completion of the task
echo "Commands successfully appended to wayfire.ini"

# Install Nginx
echo "Installing Nginx..."
sudo apt update
sudo apt install nginx -y

# Set up Nginx configuration
echo "Setting up Nginx configuration..."
sudo bash -c 'cat <<EOF > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        try_files $uri $uri/ =404;
    }
}
EOF'

# Enable the Nginx configuration
# sudo ln -s /etc/nginx/sites-available/yourapp /etc/nginx/sites-enabled/
# sudo rm /etc/nginx/sites-enabled/default

# Restart Nginx to apply the changes
echo "Restarting Nginx..."
# sudo systemctl restart nginx

# echo "Starting PictureFrame..."
# npm run start

# Display completion message
echo "Installation and setup complete!"

# Restarting device
sudo reboot
