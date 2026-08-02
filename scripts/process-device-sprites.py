from pathlib import Path

from PIL import Image, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "tmp" / "imagegen"
OUTPUT_DIR = ROOT / "assets" / "sprites"


def process(source: Path) -> Path:
    image = Image.open(source).convert("RGBA")
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        raise ValueError(f"No visible sprite pixels in {source.name}")

    cropped = image.crop(bounds)
    side = max(cropped.width, cropped.height)
    padding = max(20, round(side * 0.075))
    canvas_side = side + padding * 2
    canvas = Image.new("RGBA", (canvas_side, canvas_side), (0, 0, 0, 0))
    canvas.alpha_composite(cropped, ((canvas_side - cropped.width) // 2, (canvas_side - cropped.height) // 2))

    sprite = canvas.resize((256, 256), Image.Resampling.LANCZOS)
    rgb = Image.merge("RGB", sprite.split()[:3])
    rgb = ImageEnhance.Contrast(rgb).enhance(1.06)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.3)
    sprite = Image.merge("RGBA", (*rgb.split(), sprite.getchannel("A")))

    output = OUTPUT_DIR / source.name.replace("-alpha", "")
    sprite.save(output, optimize=True)
    return output


if __name__ == "__main__":
    files = sorted(SOURCE_DIR.glob("device-*-alpha.png"))
    if not files:
        raise SystemExit("No device alpha sprites found")
    for file in files:
        print(process(file))
