# Remove PictureFrame app
echo "Removing current PictureFrame app..."
sudo rm -rf pictureframe

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
echo "Change directory to pictureframe..."
cd pictureframe || { echo "Failed to change directory to pictureframe"; exit 1; }

# Install PM2
echo "Installing pm2..."
npm install pm2 -g || { echo "pm2 installation failed"; exit 1; }

# Display completion message
echo "Update completed!"

# Restarting device
sudo reboot || { echo "sudo reboot failed"; exit 1; }