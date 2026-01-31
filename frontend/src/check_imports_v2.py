import os

def check_files(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for file in files:
            if file.endswith(('.jsx', '.tsx')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        
                        has_chevron_usage = False
                        has_chevron_import = False
                        
                        for line in lines:
                            if '<ChevronRight' in line:
                                has_chevron_usage = True
                            if 'ChevronRight' in line and (('import' in line and 'lucide-react' in line) or 'from \'lucide' in line):
                                has_chevron_import = True
                        
                        # Extra check for multiline imports
                        content = "".join(lines)
                        if 'ChevronRight' in content and 'import' in content and 'lucide-react' in content:
                            if 'import' in content and '{' in content and '}' in content:
                                import_block = content[content.find('import'):content.find('lucide-react')+20]
                                if 'ChevronRight' in import_block:
                                    has_chevron_import = True

                        if has_chevron_usage and not has_chevron_import:
                            print(f"FILE MISSING IMPORT: {path}")
                except Exception as e:
                    pass

if __name__ == "__main__":
    check_files(r'c:\Users\Coding-Kimz\Desktop\New folder\Lifeline\frontend\src')
