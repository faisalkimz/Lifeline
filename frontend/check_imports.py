import os
import re

def check_files(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if 'dist' in dirs:
            dirs.remove('dist')
            
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        if 'ChevronRight' in content:
                            import_match = re.search(r"import\s+{[^}]*\bChevronRight\b[^}]*}\s+from\s+['\"]lucide-react['\"]", content, re.DOTALL)
                            if not import_match:
                                if not re.search(r"import\s+\bChevronRight\b", content):
                                    # Check if it's defined in the file
                                    if not (f"const ChevronRight =" in content or f"function ChevronRight" in content or f"class ChevronRight" in content):
                                        print(f"FILE MISSING IMPORT: {path}")
                except Exception as e:
                    pass

if __name__ == "__main__":
    check_files(r'c:\Users\Coding-Kimz\Desktop\New folder\Lifeline\frontend')
