import csv, os, requests

API_BASE = os.getenv("API_BASE", "http://localhost:8000")
TOKEN = os.getenv("TOKEN")  # set this in your shell

def main():
    if not TOKEN:
        print("Set TOKEN env var with your Bearer token from /auth/login")
        return
    path = os.getenv("CSV_PATH", "rag/resources.sample.csv")
    rows = []
    with open(path, newline='', encoding="utf-8") as f:
        for r in csv.DictReader(f):
            rows.append({
                "title": r["title"],
                "url": r["url"],
                "source": r["source"],
                "tags": r["tags"],
                "level": r["level"],
                "lang": r["lang"],
                "duration_min": int(r["duration_min"] or 0),
            })
    print(f"Uploading {len(rows)} resources...")
    r = requests.post(f"{API_BASE}/resources/ingest_bulk", json=rows, headers={"Authorization": f"Bearer {TOKEN}"})
    r.raise_for_status()
    print("Response:", r.json())

if __name__ == "__main__":
    main()
