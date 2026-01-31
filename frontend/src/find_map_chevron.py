import os
import re

def find_chevron_in_map(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        # Find all maps
                        maps = re.findall(r'\.map\s*\((.*?)\)\s*=>\s*\{(.*?)\}', content, re.DOTALL)
                        # Also simple arrow functions without braces
                        maps += re.findall(r'\.map\s*\((.*?)\)\s*=>\s*\((.*?)\)', content, re.DOTALL)
                        
                        for params, body in maps:
                            if 'ChevronRight' in body:
                                # Check if ChevronRight is imported
                                if 'ChevronRight' not in content or not re.search(r"import\s+{[^}]*\bChevronRight\b[^}]*}\s+from\s+['\"]lucide-react['\"]", content, re.DOTALL):
                                     print(f"FOUND IN MAP BUT POTENTIALLY MISSING IMPORT: {path}")
                except Exception as e:
                    pass

if __name__ == "__main__":
    find_chevron_in_map(r'c:\Users\Coding-Kimz\Desktop\New folder\Lifeline\frontend\src')
