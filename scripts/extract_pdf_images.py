import fitz
import os
import sys
import re
import math

def distance(rect1, rect2):
    # center distance
    c1x = (rect1.x0 + rect1.x1)/2
    c1y = (rect1.y0 + rect1.y1)/2
    c2x = (rect2.x0 + rect2.x1)/2
    c2y = (rect2.y0 + rect2.y1)/2
    return math.hypot(c1x - c2x, c1y - c2y)

def extract_images_from_pdf(pdf_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Get text blocks
        blocks = page.get_text("blocks")
        # Find product code blocks
        code_blocks = []
        for b in blocks:
            text = b[4].strip()
            # Match 5 digit number
            matches = re.findall(r'\b\d{5}\b', text)
            if matches:
                for match in matches:
                    code_blocks.append({
                        "rect": fitz.Rect(b[:4]),
                        "code": match
                    })
        
        # Get images
        image_list = page.get_images(full=True)
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # Get image rect
            rects = page.get_image_rects(xref)
            if not rects:
                continue
            img_rect = rects[0]
            
            # Find closest code
            closest_code = None
            min_dist = float('inf')
            
            for cb in code_blocks:
                dist = distance(img_rect, cb["rect"])
                if dist < min_dist:
                    min_dist = dist
                    closest_code = cb["code"]
            
            if closest_code and min_dist < 300: # Threshold
                save_path = os.path.join(output_dir, f"{closest_code}.{image_ext}")
                with open(save_path, "wb") as f:
                    f.write(image_bytes)
                print(f"Extracted {closest_code} from page {page_num+1} (dist: {min_dist:.2f})")
            else:
                # Save as unknown
                save_path = os.path.join(output_dir, f"unknown_page{page_num+1}_{img_index}.{image_ext}")
                with open(save_path, "wb") as f:
                    f.write(image_bytes)
                print(f"Extracted unknown from page {page_num+1} (closest dist: {min_dist:.2f})")

if __name__ == "__main__":
    pdf_path = sys.argv[1]
    out_dir = sys.argv[2]
    extract_images_from_pdf(pdf_path, out_dir)
