"""Check every quotation in docs/guide-data.js against the page of Makin's PDF that it cites.

Usage:
    python3 tools/check_quotes.py --dir <folder with Makin's PDFs>

The PDFs are not in this repository. Download them from Makin's own page,
https://www.makin3d.com/about/knowledge/knowledge-downloads/ , into any folder and pass it with --dir.
Release-note quotes cite a version instead of a page; the check looks inside that version's block.
Exits with status 1 if any quotation is not found where it says it is.
"""
import argparse
import json
import os
import re
import sys

FILES = {
    "EX": "Makin_Excavator_3D_Manual_EN.pdf",
    "SV": "Makin_Survey_Manual_EN.pdf",
    "WL": "Makin_Wheel_Loader_Manual_EN.pdf",
    "RN": "makin_3d_rel_notes.pdf",
}


def norm(s):
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", s).strip()


def pages(path):
    try:
        import pypdfium2 as pdfium
        doc = pdfium.PdfDocument(path)
        return [doc[i].get_textpage().get_text_range() for i in range(len(doc))]
    except ImportError:
        from pypdf import PdfReader
        return [p.extract_text() or "" for p in PdfReader(path).pages]


def version_block(text, version):
    """Text of one release-note version, from its heading to the next heading."""
    heads = list(re.finditer(r"(?im)^\s*v\.?\s?(\d+(?:\.\d+)+)\s*$", text))
    for i, h in enumerate(heads):
        if h.group(1) == version:
            end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
            return text[h.start():end]
    return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    ap.add_argument("--data", default=os.path.join(os.path.dirname(__file__), "..", "docs", "guide-data.js"))
    a = ap.parse_args()

    raw = open(a.data, encoding="utf-8").read()
    guide = json.loads(raw[raw.index("{"):raw.rindex("}") + 1])
    text = {k: pages(os.path.join(a.dir, f)) for k, f in FILES.items()}

    misses = 0
    count = 0
    for t in guide["tickets"]:
        for n, s in enumerate(t["steps"], 1):
            for q in s.get("quotes", []):
                count += 1
                if q["d"] == "RN":
                    hay = version_block("\n".join(text["RN"]), q["p"])
                else:
                    hay = text[q["d"]][int(q["p"]) - 1]
                ok = norm(q["t"]) in norm(hay)
                misses += not ok
                print(f"{'ok  ' if ok else 'MISS'} {t['id']} step {n} {q['d']} {q['p']:>6}  {q['t'][:70]}")
    print(f"\n{count - misses} of {count} quotations found on the page they cite.")
    sys.exit(1 if misses else 0)


if __name__ == "__main__":
    main()
