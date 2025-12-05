#!/usr/bin/env python3
"""
Fix the DepartmentSerializer by adding the missing get_employee_count method
"""

def fix_serializer():
    with open('backend/employees/serializers.py', 'r') as f:
        content = f.read()

    # Find the get_manager_name method and add the get_employee_count method after it
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'def get_manager_name(self, obj):' in line:
            # Find the end of this method (next def or class)
            j = i + 1
            while j < len(lines) and not (lines[j].startswith('    def ') or lines[j].startswith('class ')):
                j += 1

            # Insert the new method
            lines.insert(j, '')
            lines.insert(j + 1, '    def get_employee_count(self, obj):')
            lines.insert(j + 2, '        """Get count of active employees in this department"""')
            lines.insert(j + 3, '        return obj.employee_count')
            lines.insert(j + 4, '')
            break

    with open('backend/employees/serializers.py', 'w') as f:
        f.write('\n'.join(lines))

    print('✅ Added get_employee_count method to DepartmentSerializer')

if __name__ == '__main__':
    fix_serializer()
