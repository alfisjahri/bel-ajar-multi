import os
import re

filepath = 'src/components/TabInput.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace all text-xs with text-base inside className="..." that belong to input, select, textarea
# A simpler global replace is fine:
content = content.replace('text-[10px]', 'text-xs')
content = content.replace('text-[9px]', 'text-xs')
content = content.replace('text-[11px]', 'text-sm')

# For the inputs which have text-xs font-bold...
content = content.replace('text-xs font-bold text-slate-700', 'text-base font-semibold text-slate-700')
content = content.replace('text-xs p-1.5', 'text-sm p-2') # specifically the grades input

with open(filepath, 'w') as f:
    f.write(content)

print("Fixed TabInput")
