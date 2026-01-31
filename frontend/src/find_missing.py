import os
import re

def final_check(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for file in files:
            if file.endswith(('.jsx', '.tsx')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        # Find all instances of <ChevronRight
                        if '<ChevronRight' in content:
                            # Re-verify the import specifically for THIS file
                            # Named import: import { ..., ChevronRight, ... } from 'lucide-react'
                            import_pattern = r"import\s+{[^}]*\bChevronRight\b[^}]*}\s+from\s+['\"]lucide-react['\"]"
                            if not re.search(import_pattern, content, re.DOTALL):
                                print(f"CULPRIT FOUND: {path}")
                except Exception as e:
                    pass

if __name__ == "__main__":
    final_check(r'c:\Users\Coding-Kimz\Desktop\New folder\Lifeline\frontend\src')
