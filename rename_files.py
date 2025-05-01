import os

# Set the path to your image directory
image_dir = 'chess/rectified'

# Loop through all files in the directory
for filename in os.listdir(image_dir):
    # Skip non-image files
    #out_00_00_-780.134705_-3355.331299_.png
    if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff')):
        continue

    # Split the filename and extension
    name, ext = os.path.splitext(filename)

    # Only rename if name is long enough
    if len(name) > 9:
        new_name = name[:9] + ext
        old_path = os.path.join(image_dir, filename)
        new_path = os.path.join(image_dir, new_name)

        os.rename(old_path, new_path)
        print(f"Renamed: {filename} -> {new_name}")
    else:
        print(f"Skipped (too short): {filename}")
