#!/bin/bash

# List of service pages to update
FILES=(
    "pastrimi-thelle.html"
    "pastrimi-oborreve.html"
    "pastrimi-kimik.html"
    "pastrimi-veturave.html"
    "sherbimet-sq.html"
    "pastrimi-levizjes.html"
    "pastrimi-shpejte.html"
    "sherbimet-jashtme.html"
)

# Template file (already has the new header)
TEMPLATE="pastrimi-brendshem.html"

echo "Applying header from $TEMPLATE to all service pages..."

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        # This script will be used to extract and apply changes
        # For now, just confirm files exist
        echo "  ✓ Found $file"
    else
        echo "  ✗ Not found: $file"
    fi
done

echo "Done!"
