import os
import re

files_to_process = [
    'src/components/LoginScreen.jsx',
    'src/components/TabInput.jsx',
    'src/components/TabReview.jsx',
    'src/components/TabStudents.jsx',
    'src/components/TabExport.jsx',
    'src/components/Modals.jsx',
    'src/components/BottomNavigation.jsx'
]

# Replacements
text_replacements = [
    ("Guru Mapel", "Mapel"),
    ("Wali Kelas (8A)", "Wali Kelas"),
    ("Guru Wali (Kel. 5)", "Guru Wali")
]

for filepath in files_to_process:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()

    # Apply text replacements
    for old_text, new_text in text_replacements:
        content = content.replace(old_text, new_text)

    # Change 11pt to 10.5pt
    content = content.replace('text-[11pt]', 'text-[10.5pt]')
    
    # In TabInput: pill HSIA shape reduction
    if 'TabInput' in filepath:
        # The HSIA button classes are like: flex-1 py-2 rounded-lg text-[10.5pt] font-bold ...
        # reduce py-2 to py-1
        content = re.sub(r'flex-1 py-2 rounded-lg text-\[10\.5pt\] font-bold transition-all duration-150',
                         r'flex-1 py-1 rounded-md text-[10.5pt] font-bold transition-all duration-150', content)
        
        # Improve the 3 tabs "enggak enak diliat"
        # They currently have an icon (BookOpen, WaliIcon, Users) and are flex-1 py-2 rounded-xl
        # Let's make the container p-0.5 and the buttons py-1.5, space-x-1, removing shadows from unselected to make it look like iOS segmented control
        content = content.replace('p-1 rounded-xl flex text-[10.5pt] font-semibold shadow-inner', 
                                  'p-1 bg-slate-200/80 dark:bg-slate-700/80 rounded-lg flex text-[10.5pt] font-semibold')
        # We also need to fix the button padding
        content = content.replace('flex-1 py-2 rounded-xl flex items-center justify-center space-x-1',
                                  'flex-1 py-1.5 rounded-md flex items-center justify-center space-x-1')

    # In TabReview: enlarge edit/trash buttons
    if 'TabReview' in filepath or 'TabStudents' in filepath:
        # Edit/Trash buttons are currently: `p-1 rounded-lg` or `p-1`
        # We can increase their padding to p-2 or p-2.5 and background for hover
        content = content.replace('p-1 rounded-lg text-[10.5pt]', 'p-2 rounded-lg text-[10.5pt]')
        content = content.replace('p-1 text-[10.5pt]', 'p-2 text-[10.5pt]')
        # In TabReview line ~156: <Edit className="w-3.5 h-3.5" />
        # Let's make the icon sizes for these buttons w-4 h-4
        content = content.replace('<Edit className="w-3.5 h-3.5" />', '<Edit className="w-4 h-4" />')
        content = content.replace('<Trash className="w-3.5 h-3.5" />', '<Trash className="w-4 h-4" />')

    with open(filepath, 'w') as f:
        f.write(content)

print("Tweaked UI!")
