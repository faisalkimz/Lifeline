import re

with open(r'frontend\src\store\api.js', 'r', encoding='utf-8') as f:
    content = f.read()

queries = re.finditer(r'(\w+):\s*builder\.query\(\{', content)
results = []
for m in queries:
    name = m.group(1)
    start = m.start()
    # Find the matching closing bracket for the builder.query({...})
    # This is naive but might work if we just look ahead ~500 chars
    chunk = content[start:start+1000]
    if 'transformResponse' not in chunk:
        results.append(name)

print("Queries potentially missing transformResponse:")
for r in results:
    print(f" - {r}")
