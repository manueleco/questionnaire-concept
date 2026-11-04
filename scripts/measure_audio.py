"""Inventory and BS.1770-based measurements without modifying audio files."""
import argparse, json, subprocess, re, hashlib
from pathlib import Path
parser = argparse.ArgumentParser()
parser.add_argument('files', nargs='+')
parser.add_argument('--output', required=True)
args = parser.parse_args()
rows = []
for name in args.files:
    p = Path(name)
    probe = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration:stream=sample_rate,channels', '-of', 'json', str(p)], check=True, capture_output=True, text=True)
    measurement = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-i', str(p), '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], check=True, capture_output=True, text=True)
    match = re.search('\\{\\s*"input_i".*?\\}', measurement.stderr, re.S)
    values = json.loads(match.group()) if match else {}
    rows.append({'file': p.name, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'metadata': json.loads(probe.stdout), 'integrated_lufs': values.get('input_i'), 'true_peak_dbtp': values.get('input_tp'), 'lra_lu': values.get('input_lra')})
Path(args.output).write_text(json.dumps(rows, indent=2))
