import os
import re

files = [
    'src/components/TabReview.jsx',
    'src/components/TabStudents.jsx',
    'src/components/TabExport.jsx',
    'src/components/Modals.jsx',
    'src/components/BottomNavigation.jsx'
]

for filepath in files:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()

    # Small texts
    content = content.replace('text-[10px]', 'text-xs')
    content = content.replace('text-[9px]', 'text-xs')
    content = content.replace('text-[11px]', 'text-sm')
    
    # Input texts that are text-xs
    content = content.replace('text-xs font-bold text-slate-700', 'text-base font-semibold text-slate-700')
    content = content.replace('text-xs font-semibold', 'text-base font-medium')
    
    # Let's fix the labels in TabExport
    content = content.replace('text-xs font-bold text-slate-500', 'text-sm font-semibold text-slate-600')
    
    # Let's clean up bottom navigation text size so it doesn't look weird
    content = content.replace('text-[10px] font-bold', 'text-xs font-semibold')
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Fixed other tabs")
