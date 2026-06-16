#!/usr/bin/env python3
"""Generate compliant spa images via fal.ai nano-banana-pro (parallel)."""
import json, os, sys, urllib.request, concurrent.futures

FAL_KEY = os.environ["FAL_KEY"]
ENDPOINT = "https://fal.run/fal-ai/nano-banana-pro"

STYLE = ("Bright modern room with soft natural daylight, neutral cream walls and warm wood tones, "
         "serene calm clinical spa atmosphere, photorealistic editorial wellness photography, "
         "modest and respectful, fully clothed, health and wellness focus, high detail.")

SPECS = [
    ("service-tradisional", "4:3",
     "Professional wellness photograph, close framing of a licensed massage therapist's hands, "
     "the therapist wearing a clean beige spa uniform with sleeves, gently performing a traditional "
     "relaxing back and shoulder massage on a calm client who is lying face down and fully draped with a "
     "clean white spa towel, only the upper shoulders and upper back visible, modest. " + STYLE),

    ("service-vitalitas", "4:3",
     "Professional wellness photograph, a licensed massage therapist in a clean beige spa uniform with "
     "sleeves performing a firm therapeutic upper-back and shoulder muscle-recovery massage on a calm client "
     "lying face down, the client fully covered with a clean white spa towel over the back, only upper shoulders "
     "visible, focused professional posture for stamina and recovery, modest and respectful. " + STYLE),

    ("service-lulur", "4:3",
     "Professional spa wellness still-life and treatment photograph of a natural herbal body scrub session: "
     "small wooden and ceramic bowls of natural exfoliating scrub made of rice, turmeric and herbs, white spa towels, "
     "fresh flower petals, and a therapist's clean hands gently applying scrub onto a client's shoulder and upper arm only, "
     "client otherwise draped with a white towel, skincare and brightening focus, modest. " + STYLE),

    ("service-refleksi", "4:3",
     "Professional wellness photograph of a foot reflexology therapy session: a licensed therapist's hands in a beige spa "
     "uniform applying acupressure and reflexology massage to a client's foot resting on a folded white spa towel, a wooden "
     "bowl with warm water and flower petals and a small towel nearby, focus on the foot and hands for blood circulation therapy, "
     "calm and clinical. " + STYLE),

    ("supplies", "16:9",
     "Professional spa still-life photograph, no people: neatly arranged rolled white towels, a ceramic bottle of massage oil, "
     "a lit white candle, smooth grey massage stones, a small bowl of oil, and fresh eucalyptus leaves arranged on a warm wooden "
     "surface, bright soft natural daylight, neutral cream and beige tones, serene minimal wellness composition, photorealistic, calm. "),
]

def gen(spec):
    name, ar, prompt = spec
    body = json.dumps({"prompt": prompt, "num_images": 1, "aspect_ratio": ar, "output_format": "jpeg"}).encode()
    req = urllib.request.Request(ENDPOINT, data=body, method="POST",
                                 headers={"Authorization": f"Key {FAL_KEY}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            data = json.load(r)
        url = data["images"][0]["url"]
        out = f"_gen/{name}_raw.jpg"
        urllib.request.urlretrieve(url, out)
        sz = os.path.getsize(out)
        return f"OK   {name:22s} {data['images'][0]['width']}x{data['images'][0]['height']}  {sz} bytes  -> {out}"
    except Exception as e:
        return f"FAIL {name:22s} {e}"

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    for line in ex.map(gen, SPECS):
        print(line)
