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
                        
                        # Find if ChevronRight is used anywhere EXCEPT in an import statement
                        # We'll split content into lines and check
                        lines = content.split('\n')
                        used_not_imported = False
                        is_imported = False
                        
                        for line in lines:
                            if 'import ' in line and 'ChevronRight' in line and 'lucide-react' in line:
                                is_imported = True
                            
                            # Multiline import check
                            # (not perfect but let's see)
                        
                        if not is_imported:
                            # Re-check multiline import
                            if re.search(r"import\s+{[^}]*\bChevronRight\b[^}]*}\s+from\s+['\"]lucide-react['\"]", content, re.DOTALL):
                                is_imported = True
                                
                        if not is_imported:
                            # Check if it's used
                            usage_patterns = [
                                r'<ChevronRight',
                                r'icon:\s*ChevronRight',
                                r'component:\s*ChevronRight',
                                r'{\s*ChevronRight\s*}',
                                r'\[\s*ChevronRight\s*\]'
                            ]
                            for pattern in usage_patterns:
                                if re.search(pattern, content):
                                    used_not_imported = True
                                    break
                                    
                        if used_not_imported:
                             # Final check: maybe it's defined locally?
                             if not (f"const ChevronRight =" in content or f"function ChevronRight" in content):
                                 print(f"CULPRIT FOUND: {path}")
                except Exception as e:
                    pass

if __name__ == "__main__":
    final_check(r'c:\Users\Coding-Kimz\Desktop\New folder\Lifeline\frontend\src')
