from pathlib import Path
from PIL import Image

ROOT = Path('/home/ubuntu/dil-hafizasi/assets/images')
FILES = [
    ('lesson-01-dilek-morning.png', 'lesson-01-dilek-morning.jpg'),
    ('lesson-02-office-help.png', 'lesson-02-office-help.jpg'),
    ('memory-practice-desk.png', 'memory-practice-desk.jpg'),
    ('lesson-02-coffee-shop.png', 'lesson-02-coffee-shop.jpg'),
    ('lesson-03-weekend-plan.png', 'lesson-03-weekend-plan.jpg'),
    ('lesson-04-grocery.png', 'lesson-04-grocery.jpg'),
    ('lesson-05-directions.png', 'lesson-05-directions.jpg'),
    ('lesson-06-doctor.png', 'lesson-06-doctor.jpg'),
    ('lesson-07-restaurant.png', 'lesson-07-restaurant.jpg'),
    ('lesson-08-hotel.png', 'lesson-08-hotel.jpg'),
    ('lesson-09-interview.png', 'lesson-09-interview.jpg'),
    ('lesson-10-airport.png', 'lesson-10-airport.jpg'),
    ('lesson-11-phone-call.png', 'lesson-11-phone-call.jpg'),
    ('lesson-12-presentation.png', 'lesson-12-presentation.jpg'),
]

for source_name, target_name in FILES:
    source = ROOT / source_name
    if not source.exists():
        continue
    image = Image.open(source).convert('RGB')
    image.thumbnail((1280, 960), Image.Resampling.LANCZOS)
    image.save(ROOT / target_name, 'JPEG', quality=82, optimize=True, progressive=True)
    print(f'{source_name} -> {target_name} {image.size}')
