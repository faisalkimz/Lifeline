import os
import re

def check_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        # Find if ChevronRight is used in the code
                        if 'ChevronRight' in content:
                            # Check if it's imported from lucide-react
                            # We look for something like import { ..., ChevronRight, ... } from 'lucide-react'
                            import_match = re.search(r"import\s+{[^}]*\bChevronRight\b[^}]*}\s+from\s+['\"]lucide-react['\"]", content, re.DOTALL)
                            
                            if not import_match:
                                # Also check for 'import ChevronRight from ...' just in case, though usually it's named import
                                if not re.search(r"import\s+\bChevronRight\b", content):
                                    print(f"FILE MISSING IMPORT: {path}")
                except Exception as e:
                    pass

if __name__ == "__main__":
    check_files(r'c:\Users\Coding-Kimz\Desktop\New folder\Lifeline\frontend\src')
