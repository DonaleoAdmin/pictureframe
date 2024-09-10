#!/bin/bash

# Ensure the temporary directory exists
mkdir -p /tmp/feh_images

# Define the URL source
URL_SOURCE="https://www.dropbox.com/sc/axmduh2ltptur04/AACw8N-Kta9R_HC5xxAfI7-ma`"
# "https://photos.app.goo.gl/V8DESxcypEFUwd6m9"

# Fetch the page and extract image URLs
curl -s "$URL_SOURCE" | grep -oP '(?<=src=")[^"]*(?=")' > image_urls.txt

# Download each image in the list using wget
while IFS= read -r url; do
    wget "$url" -P /tmp/feh_images
done < image_urls.txt

# Display the downloaded images using feh
feh /tmp/feh_images
