
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random
import math
import os

# Configuration
BG_PATH = r"c:\Users\PC2301\Desktop\btsarmy-app\public\ai_background.png"
OUTPUT_PATH_512 = r"c:\Users\PC2301\Desktop\btsarmy-app\public\icon-512.png"
OUTPUT_PATH_192 = r"c:\Users\PC2301\Desktop\btsarmy-app\public\icon-192.png"

# Font - try to find a bold font
FONT_PATHS = [
    r"C:\Windows\Fonts\arialbd.ttf",
    r"C:\Windows\Fonts\seguiemj.ttf",
    r"C:\Windows\Fonts\malgunbd.ttf"
]
FONT_PATH = None
for p in FONT_PATHS:
    if os.path.exists(p):
        FONT_PATH = p
        break

if not FONT_PATH:
    # Fallback to default if no system font found (unlikely on Windows)
    FONT_PATH = "arial.ttf"

def generate_icon():
    print(f"Loading background from {BG_PATH}")
    try:
        if os.path.exists(BG_PATH):
            img = Image.open(BG_PATH).convert("RGBA")
            img = img.resize((512, 512), Image.Resampling.LANCZOS)
        else:
            # Fallback Gradient Background
            print("Background not found, creating gradient")
            img = Image.new("RGBA", (512, 512), (0, 0, 0, 255))
            draw = ImageDraw.Draw(img)
            # Simple radial gradient simulation
            for r in range(256, 0, -1):
                color = (int(90 * r/256), int(24 * r/256), int(154 * r/256))
                draw.ellipse([256-r, 256-r, 256+r, 256+r], fill=color)

    except Exception as e:
        print(f"Error loading bg: {e}")
        img = Image.new("RGBA", (512, 512), (30, 0, 60, 255))

    # Create overlay for shield interior (Masking)
    overlay = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    
    cx, cy = 256, 256
    scale = 0.88
    
    # Shield points approximation
    points = [
        (cx - 100 * scale, cy - 90 * scale),
        (cx + 100 * scale, cy - 90 * scale),
        (cx + 100 * scale, cy + 20 * scale),
        (cx, cy + 150 * scale), # Curve bottom approx
        (cx - 100 * scale, cy + 20 * scale)
    ]
    # Curve handling is hard with polygon, just use polygon + ellipse for bottom
    # Actually polygon is fine for the mask area
    d.polygon(points, fill=(20, 10, 40, 240)) # Dark purple/black, semi-transparent
    
    # Composite overlay
    img = Image.alpha_composite(img, overlay)
    
    # Draw Text
    txt_layer = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    d_txt = ImageDraw.Draw(txt_layer)
    
    bats = ['B', 'T', 'S']
    army = ['A', 'R', 'M', 'Y']
    all_chars = [{'char': c, 'type': 'bts'} for c in bats] + [{'char': c, 'type': 'army'} for c in army]
    random.shuffle(all_chars)
    
    placed_items = []
    
    for item in all_chars:
        char = item['char']
        ctype = item['type']
        
        # Color Logic
        if ctype == 'bts':
            colors = [(255, 215, 0), (253, 185, 49), (212, 175, 55)] # Gold
            shadow_color = (255, 215, 0, 100)
            base_size = 70
        else:
            colors = [(255, 255, 255), (224, 170, 255), (216, 191, 216)] # Silver/Lilac
            shadow_color = (157, 78, 221, 100)
            base_size = 60
            
        color = random.choice(colors) + (255,)
        
        # Placement
        best_x, best_y, best_size, best_rot = cx, cy, base_size, 0
        min_overlap = float('inf')
        
        for _ in range(50):
            spread_x = 140
            spread_y = 160
            x = cx + (random.random() - 0.5) * spread_x
            y = cy + (random.random() - 0.5) * spread_y - 10
            
            size = base_size + random.random() * 40
            rot = (random.random() - 0.5) * 40 # Degrees
            
            # Check overlap logic simplified
            current_overlap = 0
            
            # Shield bounds check
            if x - size/2 < cx - 110: current_overlap += 1000
            if x + size/2 > cx + 110: current_overlap += 1000
            if y - size/2 < cy - 100: current_overlap += 1000
            
            # Bottom taper check (Triangle approx)
            if y > cy:
                dy = y - cy
                max_dx = 110 - (dy * 0.6)
                if abs(x - cx) + size/3 > max_dx: current_overlap += 1000
            
            # Text overlap
            for px, py, psize in placed_items:
                dist = math.hypot(x - px, y - py)
                radius_sum = (size + psize) * 0.45
                if dist < radius_sum:
                     current_overlap += (radius_sum - dist) * 5
            
            if current_overlap < min_overlap:
                min_overlap = current_overlap
                best_x, best_y, best_size, best_rot = x, y, size, rot
            
            if current_overlap == 0:
                break
        
        placed_items.append((best_x, best_y, best_size))
        
        # Draw single char
        try:
            font = ImageFont.truetype(FONT_PATH, int(best_size))
        except:
            font = ImageFont.load_default()
            
        # We need to rotate text, so draw on temp image then paste
        char_img = Image.new("RGBA", (int(best_size*2), int(best_size*2)), (0,0,0,0))
        d_char = ImageDraw.Draw(char_img)
        
        # Draw shadow
        # Simple shadow offset
        d_char.text((best_size, best_size), char, font=font, fill=shadow_color, anchor="mm")
        # Blur shadow? (Requires filter on separate layer, skip for speed)
        
        # Draw text
        d_char.text((best_size-2, best_size-2), char, font=font, fill=color, anchor="mm")
        
        # Stroke
        d_char.text((best_size-2, best_size-2), char, font=font, fill=color, anchor="mm", stroke_width=2, stroke_fill=(0,0,0,200))

        # Rotate
        rotated = char_img.rotate(best_rot, resample=Image.Resampling.BICUBIC, expand=1)
        
        # Paste
        paste_pos = (int(best_x - rotated.width/2), int(best_y - rotated.height/2))
        txt_layer.paste(rotated, paste_pos, rotated)

    # Composite text
    img = Image.alpha_composite(img, txt_layer)
    
    # Save
    print(f"Saving to {OUTPUT_PATH_512}")
    img.save(OUTPUT_PATH_512)
    
    print(f"Saving to {OUTPUT_PATH_192}")
    img.resize((192, 192), Image.Resampling.LANCZOS).save(OUTPUT_PATH_192)
    print("Done")

if __name__ == "__main__":
    generate_icon()
