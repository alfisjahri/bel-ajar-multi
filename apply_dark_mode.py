import os
import re

files_to_process = [
    'src/App.jsx',
    'src/components/LoginScreen.jsx',
    'src/components/TabInput.jsx',
    'src/components/TabReview.jsx',
    'src/components/TabStudents.jsx',
    'src/components/TabExport.jsx',
    'src/components/BottomNavigation.jsx',
    'src/components/Modals.jsx'
]

mappings = {
    r'\bbg-white\b': 'bg-white dark:bg-slate-800',
    r'\bbg-slate-50\b': 'bg-slate-50 dark:bg-slate-900',
    r'\bbg-slate-100\b': 'bg-slate-100 dark:bg-slate-900',
    r'\bbg-slate-200\b': 'bg-slate-200 dark:bg-slate-700',
    r'\btext-slate-900\b': 'text-slate-900 dark:text-slate-50',
    r'\btext-slate-800\b': 'text-slate-800 dark:text-slate-100',
    r'\btext-slate-700\b': 'text-slate-700 dark:text-slate-200',
    r'\btext-slate-600\b': 'text-slate-600 dark:text-slate-300',
    r'\btext-slate-500\b': 'text-slate-500 dark:text-slate-400',
    r'\btext-slate-400\b': 'text-slate-400 dark:text-slate-500',
    r'\bborder-slate-200\b': 'border-slate-200 dark:border-slate-700',
    r'\bborder-slate-100\b': 'border-slate-100 dark:border-slate-800',
    r'\bborder-slate-300\b': 'border-slate-300 dark:border-slate-600',
}

for filepath in files_to_process:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    for pattern, replacement in mappings.items():
        # Only replace if it doesn't already have a dark: counterpart (simple check)
        # We can just do a raw replace if we are careful, but wait, if it's already there? 
        # Since we just added this requirement, it shouldn't be there.
        # Let's ensure we only replace inside className="..." strings or template literals.
        # Actually a global regex replace is fine if we are careful not to double replace.
        content = re.sub(pattern + r'(?! dark:)', replacement, content)
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Dark mode classes applied!")
