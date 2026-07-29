import os
import re

files_to_process = [
    'src/components/TabInput.jsx',
    'src/components/TabReview.jsx',
    'src/components/TabStudents.jsx',
    'src/components/TabExport.jsx',
    'src/components/Modals.jsx',
    'src/components/BottomNavigation.jsx'
]

# Order matters!
replacements = [
    (r'\bfont-black\b', 'font-bold'),
    (r'\bfont-extrabold\b', 'font-semibold'),
    (r'\btext-\[9px\]\b', 'text-xs'),
    (r'\btext-\[10px\]\b', 'text-xs'),
    (r'\btext-\[11px\]\b', 'text-sm'),
    # text-xs to text-sm mostly, except where we want to preserve it. Actually text-xs is often okay for badges.
    # We will specifically target inputs and labels.
    (r'<label className="(.*?)text-xs(.*?)">', r'<label className="\1text-sm\2">'),
    (r'<input(.*?)text-xs(.*?)>', r'<input\1text-base\2>'),
    (r'<select(.*?)text-xs(.*?)>', r'<select\1text-base\2>'),
    (r'<textarea(.*?)text-xs(.*?)>', r'<textarea\1text-base\2>'),
    (r'<input(.*?)text-sm(.*?)>', r'<input\1text-base\2>'),
    (r'<select(.*?)text-sm(.*?)>', r'<select\1text-base\2>'),
    (r'<textarea(.*?)text-sm(.*?)>', r'<textarea\1text-base\2>'),
    
    # Standardize padding for buttons and cards to feel more breathable
    (r'p-2\.5', 'p-3'),
    (r'py-3\.5', 'py-4'),
    
    # Soften borders
    (r'border-slate-200', 'border-slate-100'),
    (r'dark:border-slate-700/80', 'dark:border-slate-700/60')
]

for filepath in files_to_process:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    for pattern, rep in replacements:
        content = re.sub(pattern, rep, content)
        
    with open(filepath, 'w') as f:
        f.write(content)

print("UI Polish completed!")
