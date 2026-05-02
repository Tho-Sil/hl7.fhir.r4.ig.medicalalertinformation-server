#!/usr/bin/env python3
"""
Extract alert-label motivations from Socialstyrelsen's kodverkslista (xlsx)
and emit demo/data/alert-label-definitions.json keyed by SEAlertLabelCS code.

Match rows to FSH codes via the Swedish display string on * #code "Display".

Usage (from server repo root):
  python3 demo/scripts/build_alert_label_definitions.py \\
    --xlsx ../hl7.fhir.r4.ig.medicalalertinformation/input/context/2025-12-9984-bilaga-kodverkslista.xlsx \\
    --fsh ../hl7.fhir.r4.ig.medicalalertinformation/input/fsh/SEAlertInformationAlertLabel.fsh \\
    --out demo/data/alert-label-definitions.json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def col_letters_to_num(letters: str) -> int:
    n = 0
    for c in letters.upper():
        n = n * 26 + (ord(c) - ord("A") + 1)
    return n


def num_to_col_letters(n: int) -> str:
    s = ""
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def parse_cell_ref(ref: str) -> tuple[int, int]:
    m = re.match(r"^([A-Za-z]+)(\d+)$", ref.strip())
    if not m:
        raise ValueError(ref)
    return int(m.group(2)), col_letters_to_num(m.group(1))


def parse_range(rng: str) -> tuple[int, int, int, int]:
    a, b = rng.split(":")
    r1, c1 = parse_cell_ref(a)
    r2, c2 = parse_cell_ref(b)
    return min(r1, r2), max(r1, r2), min(c1, c2), max(c1, c2)


def load_shared_strings(z: zipfile.ZipFile) -> list[str]:
    root = ET.fromstring(z.read("xl/sharedStrings.xml"))
    out: list[str] = []
    for si in root.findall("m:si", NS):
        parts: list[str] = []
        for t in si.findall(".//m:t", NS):
            if t.text:
                parts.append(t.text)
        out.append("".join(parts))
    return out


def cell_text(c: ET.Element, strings: list[str]) -> str | None:
    t = c.get("t")
    v_el = c.find("m:v", NS)
    if v_el is None or v_el.text is None:
        return None
    raw = v_el.text
    if t == "s":
        return strings[int(raw)]
    return raw


def sheet_cell_map(z: zipfile.ZipFile, sheet_path: str, strings: list[str]) -> dict[tuple[int, int], str]:
    root = ET.fromstring(z.read(sheet_path))
    grid: dict[tuple[int, int], str] = {}
    for row in root.findall(".//m:sheetData/m:row", NS):
        for c in row.findall("m:c", NS):
            ref = c.get("r")
            if not ref:
                continue
            r, col = parse_cell_ref(ref)
            val = cell_text(c, strings)
            if val is None:
                continue
            val = val.strip()
            if val:
                grid[(r, col)] = val
    merge_root = root.find("m:mergeCells", NS)
    if merge_root is not None:
        for mc in merge_root.findall("m:mergeCell", NS):
            rng = mc.get("ref")
            if not rng:
                continue
            rlo, rhi, clo, chi = parse_range(rng)
            tl = grid.get((rlo, clo))
            if not tl:
                continue
            for rr in range(rlo, rhi + 1):
                for cc in range(clo, chi + 1):
                    grid[(rr, cc)] = tl
    return grid


def workbook_sheets(z: zipfile.ZipFile) -> list[tuple[str, str]]:
    """Return [(sheet_name, worksheet_path_in_zip), ...] in workbook order."""
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    rid_to_target = {rel.get("Id"): rel.get("Target") for rel in rels.findall("{http://schemas.openxmlformats.org/package/2006/relationships}Relationship")}
    out = []
    for sh in wb.find("m:sheets", NS).findall("m:sheet", NS):
        name = sh.get("name") or ""
        rid = sh.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
        tgt = rid_to_target.get(rid, "")
        if tgt.startswith("/"):
            tgt = tgt[1:]
        path = "xl/" + tgt
        out.append((name, path))
    return out


def norm_display(s: str) -> str:
    s = s.replace("\xa0", " ").strip()
    s = re.sub(r"\s+", " ", s)
    return s.casefold()


def parse_fsh_codes(fsh_path: Path) -> list[tuple[str, str]]:
    """Return [(code, display), ...] from * #code "Display" lines."""
    text = fsh_path.read_text(encoding="utf-8")
    pat = re.compile(r'^\* #([a-z0-9-]+)\s+"([^"]*)"', re.MULTILINE)
    return [(m.group(1), m.group(2)) for m in pat.finditer(text)]


def extract_pairs_from_grid(grid: dict[tuple[int, int], str]) -> list[tuple[str, str]]:
    """Find Motivering column; pair label cell (col A) with motivation text."""
    mot_col = None
    header_row = None
    for (r, c), val in grid.items():
        if val.strip() == "Motivering":
            mot_col = c
            header_row = r
            break
    if mot_col is None:
        return []
    name_col = 1
    pairs: list[tuple[str, str]] = []
    last_mot = ""
    for r in sorted({k[0] for k in grid}):
        if header_row is not None and r <= header_row:
            continue
        name = grid.get((r, name_col), "").strip()
        mot = grid.get((r, mot_col), "").strip()
        if mot:
            last_mot = mot
        elif last_mot:
            mot = last_mot
        if not name or len(name) < 2:
            continue
        if name.lower() in ("kod", "namn", "motivering", "ja", "nej"):
            continue
        if mot and not name.startswith("http") and "|" not in name[:5]:
            pairs.append((name, mot))
    return pairs


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--xlsx", type=Path, required=True)
    ap.add_argument("--fsh", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()

    skip_sheets = {"INTRODUKTION", "Innehåll", "Ändringar"}

    with zipfile.ZipFile(args.xlsx, "r") as z:
        strings = load_shared_strings(z)
        by_display: dict[str, str] = {}
        for sheet_name, sheet_path in workbook_sheets(z):
            if sheet_name in skip_sheets:
                continue
            try:
                grid = sheet_cell_map(z, sheet_path, strings)
            except KeyError:
                continue
            for name, mot in extract_pairs_from_grid(grid):
                by_display.setdefault(norm_display(name), mot)

    codes = parse_fsh_codes(args.fsh)
    out_obj: dict[str, str] = {}
    missing: list[str] = []
    for code, display in codes:
        key = norm_display(display)
        mot = by_display.get(key)
        if mot:
            out_obj[code] = mot
        else:
            missing.append(f"{code} ({display!r})")

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(out_obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(out_obj)} definitions to {args.out}")
    if missing:
        print(f"WARNING: {len(missing)} codes without match in xlsx (by display):", file=sys.stderr)
        for m in missing[:25]:
            print("  ", m, file=sys.stderr)
        if len(missing) > 25:
            print(f"  ... and {len(missing) - 25} more", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
