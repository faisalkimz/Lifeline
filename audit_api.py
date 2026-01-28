import re

with open(r'frontend\src\store\api.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the transformResponse block to inject
transform_block = """      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response?.results && Array.isArray(response.results)) return response.results;
        return [];
      },
"""

# Patterns: 
# 1. plural name queries: getDocuments, getNotifications, etc.
# 2. specific names: getSecurityLogs (if it's a list)
# 3. existing query definitions that don't have transformResponse

# We'll target builder.query definitions specifically.
# Example:
#     getEmployees: builder.query({
#       query: (params) => ({
#         url: '/employees/',
#         params
#       }),
#       providesTags: ['Employee']
#     }),

def inject_transform(content):
    # Regex to find builder.query blocks
    # Group 1: query name
    # Group 2: before } providing tags or query
    pattern = r'(\w+):\s*builder\.query\(\{([\s\S]*?)(\s*)(providesTags|query|invalidatesTags|})\s*'
    
    def repl(match):
        name = match.group(1)
        body = match.group(2)
        indent = match.group(3)
        suffix = match.group(4)
        
        # Heuristic for "list" queries: ends with 's' or ends with 'Logs' or ends with 'History' or contains 'Records'
        is_list = (
            name.endswith('s') or 
            name.endswith('Logs') or 
            name.endswith('History') or 
            'Records' in name or
            'Analytics' in name or
            name in ['getGCCSettings', 'getStorageStats'] # maybe these too
        )
        
        if is_list and 'transformResponse' not in body:
            # We insert before providesTags if it exists, otherwise at the end
            if 'providesTags' in body:
                parts = re.split(r'(\s*)providesTags', body, 1)
                new_body = parts[0] + transform_block + parts[1] + 'providesTags' + (parts[2] if len(parts) > 2 else '')
                return f"{name}: builder.query({{{new_body}{suffix}"
            else:
                # Naive insertion: if it ends with query: (...) insert after that
                if 'query:' in body:
                    # Find the end of the query block
                    # This is tricky without a parser.
                    # We'll just append it before the suffix.
                     return f"{name}: builder.query({{{body}{transform_block}{indent}{suffix}"
        
        return match.group(0)

    # Actually, a simpler way: find builder.query({ ... }) and then post-process
    # But let's try a safer approach.
    
    # I'll just use a more targeted regex for common patterns in this file
    
    # Pattern where providesTags is present
    content = re.sub(
        r'(\s*)(\w+s|\w+Logs|\w+History|\w+Records):\s*builder\.query\(\{([\s\S]*?)(query:[\s\S]*?\},)(\s*)(providesTags:)',
        lambda m: f"{m.group(1)}{m.group(2)}: builder.query({{{m.group(3)}{m.group(4)}{m.group(1)}{transform_block.strip()}{m.group(1)}{m.group(6)}",
        content
    )
    
    return content

# Given the complexity of the file, it's safer to do fixed string replacements for the most critical ones first.

critical_queries = [
    'getSecurityLogs', 'getDepartments', 'getPayrollRuns', 'getSalaryStructures',
    'getPerformanceCycles', 'getReviews', 'getCandidateHistory', 'getNotifications',
    'getStorage'
]

# Let's try to find query names ending in 's' using a simple iterative approach.

lines = content.split('\n')
new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    if 'builder.query({' in line:
        query_name = line.split(':')[0].strip()
        if (query_name.endswith('s') or query_name.endswith('Logs')) and not any('transformResponse' in lines[j] for j in range(i, min(i+15, len(lines)))):
            # Look for the insertion point (after query or before providesTags)
            # This is hard to do line-by-line. 
            pass

# Let's stick to the multi_replace tool for precision.
print("Finished preparation")
