#!/usr/bin/env python3
import subprocess
import json
import os
import re
import sys

DATASET_DIR = "/home/node/.openclaw/workspace-desarrollo/projects/sistema-contabilidad-miranda/testing/dataset"
BASE_URL = "http://217.182.244.180:5000"
OUTPUT_JSON = "/home/node/.openclaw/workspace-tester/ocr_evaluation.json"

def extract_ground_truth(txt_path):
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    fields = {}
    first_line = content.split('\n')[0].strip()
    if first_line.startswith('FACTURA '):
        fields['numero_factura'] = first_line[8:].strip()
    else:
        fields['numero_factura'] = None
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if line.startswith('Proveedor:'):
            fields['proveedor'] = line.split(':', 1)[1].strip()
        elif line.startswith('Fecha:'):
            fields['fecha'] = line.split(':', 1)[1].strip()
        elif line.startswith('Total:'):
            total_str = line.split(':', 1)[1].strip()
            match = re.search(r'(\d+(?:\.\d+)?)', total_str)
            if match:
                fields['total'] = float(match.group(1))
            else:
                fields['total'] = None
        elif 'IVA' in line and ':' in line:
            iva_str = line.split(':', 1)[1].strip()
            match = re.search(r'(\d+(?:\.\d+)?)', iva_str)
            if match:
                fields['iva'] = float(match.group(1))
            else:
                fields['iva'] = None
        elif line.startswith('División:'):
            fields['division'] = line.split(':', 1)[1].strip()
    return fields

def call_ocr(pdf_path):
    cmd = ['curl', '-s', '-X', 'POST', f'{BASE_URL}/ocr/parse', '-F', f'file=@{pdf_path}']
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            print(f"curl error: {result.stderr}", file=sys.stderr)
            return None
        return json.loads(result.stdout)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return None

def compare_fields(ground, ocr):
    comparison = {}
    for key in ['numero_factura', 'proveedor', 'fecha', 'total', 'iva', 'division']:
        gt = ground.get(key)
        oc = ocr.get(key)
        if gt is None or oc is None:
            comparison[key] = {'match': False, 'ground': gt, 'ocr': oc, 'reason': 'missing'}
            continue
        if isinstance(gt, str):
            gt_norm = gt.lower().strip()
            oc_norm = str(oc).lower().strip()
            # check substring match
            match = gt_norm == oc_norm or gt_norm in oc_norm or oc_norm in gt_norm
        elif isinstance(gt, (int, float)):
            try:
                oc_num = float(oc) if isinstance(oc, (int, float, str)) else None
                match = oc_num is not None and abs(oc_num - gt) < 0.01
            except:
                match = False
        else:
            match = False
        comparison[key] = {'match': match, 'ground': gt, 'ocr': oc}
    return comparison

def main():
    pdfs = []
    for f in os.listdir(DATASET_DIR):
        if f.endswith('.pdf'):
            base = f[:-4]
            txt = base + '.txt'
            if os.path.exists(os.path.join(DATASET_DIR, txt)):
                pdfs.append((os.path.join(DATASET_DIR, f), os.path.join(DATASET_DIR, txt)))
    selected = pdfs[:5]
    print(f"Testing {len(selected)} invoices", file=sys.stderr)
    
    results = []
    for pdf, txt in selected:
        name = os.path.basename(pdf)
        print(f"Processing {name}...", file=sys.stderr)
        ground = extract_ground_truth(txt)
        ocr = call_ocr(pdf)
        if ocr is None:
            print(f"  Failed to get OCR", file=sys.stderr)
            continue
        comparison = compare_fields(ground, ocr)
        # accuracy sobre campos clave: numero, fecha, proveedor, total, iva
        key_fields = ['numero_factura', 'fecha', 'proveedor', 'total', 'iva']
        total = len(key_fields)
        matches = sum(1 for k in key_fields if comparison[k]['match'])
        accuracy = matches / total if total > 0 else 0
        results.append({
            'factura': name,
            'accuracy_percent': round(accuracy * 100, 2),
            'ground_truth': ground,
            'ocr_result': {k: ocr.get(k) for k in ['numero_factura', 'proveedor', 'fecha', 'total', 'iva', 'division', 'confidence']},
            'comparison': comparison
        })
        print(f"  Accuracy: {accuracy*100:.2f}%", file=sys.stderr)
    
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Summary
    avg = sum(r['accuracy_percent'] for r in results) / len(results) if results else 0
    print(f"\nAverage accuracy: {avg:.2f}%", file=sys.stderr)
    if avg >= 90:
        print("✅ PASS: Accuracy >90%", file=sys.stderr)
    else:
        print("❌ FAIL: Accuracy <90%", file=sys.stderr)
    
    print(f"\nResults saved to {OUTPUT_JSON}", file=sys.stderr)
    # Print JSON to stdout for capture
    with open(OUTPUT_JSON, 'r', encoding='utf-8') as f:
        print(f.read())

if __name__ == '__main__':
    main()