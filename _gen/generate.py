#!/usr/bin/env python3
"""Generate compliant spa images via fal.ai nano-banana-pro (parallel).

Therapist images use a YOUNG Indonesian/Southeast Asian woman therapist with a
warm, friendly, photogenic look — kept fully clothed, modest and professional so
it passes Google Ads policy for home-massage (a strict category). Run:
    export FAL_KEY=...   &&   python3 _gen/generate.py
"""
import json, os, urllib.request, concurrent.futures

FAL_KEY = os.environ["FAL_KEY"]
ENDPOINT = "https://fal.run/fal-ai/nano-banana-pro"

THERAPIST = ("A young Indonesian Southeast Asian woman massage therapist in her early-to-mid twenties, "
             "fresh youthful face, warm friendly genuine smile, light natural makeup, neat tied-back dark hair, "
             "wearing a clean beige spa uniform tunic with sleeves.")
STYLE = ("Bright modern room with large windows and soft natural daylight, neutral cream walls and warm wood tones, "
         "green plants and rolled white towels. Premium, inviting wellness editorial photography, soft flattering light, "
         "modest and respectful, fully clothed, professional, health and wellness focus, photorealistic, high detail.")

SPECS = [
    ("hero-portrait", "3:4",
     f"Vertical portrait wellness photograph. {THERAPIST} She is gently performing a relaxing shoulder and upper-back "
     "massage on a calm client lying face down on a proper massage table; the client is fully draped with a clean white "
     "spa towel, only the upper shoulders visible, modest. " + STYLE),

    ("service-tradisional", "4:3",
     f"Warm close framing of a traditional Javanese relaxing back and shoulder massage. {THERAPIST} Her hands work on the "
     "upper back of a calm client who is lying face down and fully draped with a clean white spa towel, only the upper back "
     "and shoulders visible, modest. " + STYLE),

    ("service-vitalitas", "4:3",
     f"A firm therapeutic upper-back and shoulder muscle-recovery massage for stamina. {THERAPIST} She works with a focused, "
     "caring expression on a calm client lying face down, fully covered with a clean white spa towel over the back, only the "
     "upper shoulders visible, modest. " + STYLE),

    ("service-lulur", "4:3",
     f"A natural herbal body-scrub (lulur) treatment, skincare focus. {THERAPIST} With clean gloved hands she gently applies "
     "natural rice-and-turmeric scrub onto a client's shoulder and upper arm only; small wooden bowls of scrub, fresh flower "
     "petals and white towels on the table, the client otherwise draped with a white towel, modest. " + STYLE),

    ("service-refleksi", "4:3",
     f"A foot reflexology therapy session for blood circulation. {THERAPIST} Her hands apply gentle acupressure to a client's "
     "foot resting on a folded white spa towel; a wooden bowl with warm water and flower petals nearby, focus on the foot and "
     "hands, calm and clinical. " + STYLE),

    ("og", "16:9",
     f"Landscape wellness editorial photograph for a social/ad preview. {THERAPIST} She is gently performing a relaxing "
     "shoulder massage on a calm client lying face down on a massage table, the client fully draped with a clean white spa "
     "towel, only upper shoulders visible, modest. Hotel-room setting with a bright window. " + STYLE),
]

def gen(spec):
    name, ar, prompt = spec
    body = json.dumps({"prompt": prompt, "num_images": 1, "aspect_ratio": ar, "output_format": "jpeg"}).encode()
    req = urllib.request.Request(ENDPOINT, data=body, method="POST",
                                 headers={"Authorization": f"Key {FAL_KEY}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=200) as r:
            data = json.load(r)
        url = data["images"][0]["url"]
        out = f"_gen/{name}_raw.jpg"
        urllib.request.urlretrieve(url, out)
        return f"OK   {name:20s} {data['images'][0]['width']}x{data['images'][0]['height']}  {os.path.getsize(out)}b -> {out}"
    except Exception as e:
        return f"FAIL {name:20s} {e}"

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
    for line in ex.map(gen, SPECS):
        print(line)
