import requests
headers = {'User-Agent': 'Mozilla/5.0'}
r = requests.get('https://student.culko.in/assets/js/student/student_attendance_summary_1.3.js?ver=1', headers=headers, timeout=10)
with open('student_attendance_summary.js', 'w', encoding='utf-8') as f:
    f.write(r.text)
print("Saved js")
