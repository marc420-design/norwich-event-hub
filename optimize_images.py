from PIL import Image
import os

def optimize_image(image_path, quality=85):
    try:
        img = Image.open(image_path)
        # Resize if too big (e.g. for a logo > 200px width is likely unnecessary if displayed small)
        # Current usage in CSS: max-width: 120px; height: 40px
        # Let's resize to 2x for retina displays: 240px width
        
        target_width = 240
        if img.width > target_width:
            ratio = target_width / img.width
            target_height = int(img.height * ratio)
            img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            print(f"Resized to {target_width}x{target_height}")

        output_path = image_path
        img.save(output_path, "JPEG", quality=quality, optimize=True)
        print(f"Optimized {image_path}")
        
    except Exception as e:
        print(f"Error optimizing {image_path}: {e}")

if __name__ == "__main__":
    path = r"C:\Users\marcc\Desktop\new company\assets\logo-image.jpg"
    if os.path.exists(path):
        optimize_image(path)
    else:
        print(f"File not found: {path}")
