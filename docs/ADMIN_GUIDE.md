# Admin Guide

How to manage the Online Exam System as an administrator.

---

## Getting Started

### Step 1: Register as Admin

1. Go to the application URL
2. Click **"Create Account"**
3. Fill in your details:
   - Full Name
   - Email Address
   - Password
   - Select **"Admin"** as role
4. Enter the **Secret Admin Code** (provided by system administrator)
5. Click **"Register"**
6. You'll be automatically logged in

### Step 2: Login

1. Go to the application URL
2. Enter your email and password
3. Click **"Sign In"**
4. You'll be redirected to admin dashboard

---

## Dashboard Overview

### Admin Sidebar

| Tab | Icon | Purpose |
|-----|------|---------|
| Enrollment Requests | 👤+ | Approve/reject student enrollments |
| Transaction History | 💰 | View payment records |
| Grading Queue | 📝 | Grade subjective exams |
| Locked Students | 🔒 | Unlock locked students |
| All Students | 👥 | View all registered students |
| Manage Courses | 📚 | Create and manage courses |
| Archived | 📦 | View archived courses |
| Settings | ⚙️ | Manage QR code and settings |

---

## Managing Courses

### Creating a Course

1. Click **"Manage Courses"** in sidebar
2. Click **"+ Create Course"**
3. Fill in course details:
   - **Title** — Course name
   - **Description** — Course description
   - **Price** — Course price (in ₹)
4. Click **"Save Course"**
5. Course appears in list as "Draft"

### Publishing a Course

1. Click on a course to expand it
2. Click **"Publish Course"** button
3. Course status changes to "Live"
4. Students can now see and enroll in the course

### Creating an Exam

1. Click on a course to expand it
2. Click **"+ New Exam"**
3. Fill in exam details:
   - **Title** — Exam name
   - **Duration** — Time limit in minutes
   - **Max Marks** — Total marks for exam
   - **Pass Marks** — Minimum marks to pass
   - **Type** — MCQ or Subjective
4. Click **"Create Exam"**

### Adding Questions

1. Click on an exam to expand it
2. Fill in question details:
   - **Question Content** — The question text
   - **Options 1-4** — Answer choices (MCQ only)
   - **Correct Option** — Which option is correct (MCQ only)
3. Click **"Add Question"**
4. Repeat for all questions

### Publishing an Exam

1. Click on an exam
2. Click **"MAKE EXAM LIVE"**
3. Students can now take the exam

### Archiving a Course/Exam

1. Hover over course/exam
2. Click **"Archive"** button
3. Confirm archiving
4. Course/exam moves to "Archived" tab
5. Students can no longer see it

---

## Managing Enrollments

### Viewing Pending Requests

1. Click **"Enrollment Requests"** in sidebar
2. See list of pending enrollments:
   - Student name
   - Course name
   - Payment method
   - Transaction reference
   - Date

### Approving Enrollments

1. Find the enrollment request
2. Click **"Approve"**
3. Student can now access the course

### Rejecting Enrollments

1. Find the enrollment request
2. Click **"Reject"**
3. Student is notified of rejection

---

## Grading Subjective Exams

### Viewing Pending Exams

1. Click **"Grading Queue"** in sidebar
2. See list of pending submissions:
   - Student name
   - Exam title
   - Attempt number
   - Submission date

### Grading an Exam

1. Click **"Grade Now"** on a submission
2. See each question and student's answer
3. Enter marks for each question:
   - Must be between 0 and max marks per question
4. Click **"Submit Grades"**
5. Student receives notification of result

### Grading Rules

- Each question has a maximum mark limit
- You cannot exceed the maximum marks
- Total marks determine pass/fail
- Student can view their marks after grading

---

## Managing Students

### Viewing All Students

1. Click **"All Students"** in sidebar
2. See list of all registered students:
   - Name
   - Email
   - Role

### Viewing Student Progress

1. Click **"View Progress"** on a student
2. See their enrolled courses
3. See their exam submissions
4. See their results

### Viewing Student Answers

1. Click **"View Progress"** on a student
2. Click **"View Details"** on an exam
3. See each question and student's answer
4. See correct answers (for MCQ)
5. See marks awarded

---

## Managing Locked Students

### Understanding the 3-Strike System

- Student gets 3 attempts per course
- After 3 failures, course locks
- Locked students cannot take more exams
- Only admin can unlock

### Viewing Locked Students

1. Click **"Locked Students"** in sidebar
2. See list of locked students:
   - Student name
   - Course name
   - Status: "EXAM_LOCKED"

### Unlocking a Student

1. Click **"Unlock"** on a locked student
2. Confirm unlock
3. Student gets 1 more attempt
4. Student can now take exams again

---

## Managing Transactions

### Viewing Transaction History

1. Click **"Transaction History"** in sidebar
2. See all approved enrollments:
   - Student name
   - Course name
   - Payment method (UPI or Cash)
   - Date

### Transaction Details

Each transaction shows:
- Student who enrolled
- Course enrolled in
- Payment method
- Transaction reference (if UPI)
- Date of approval

---

## Managing QR Code

### Uploading QR Code

1. Click **"Settings"** in sidebar
2. Click **"Upload QR Code"**
3. Select QR code image (PNG or JPEG)
4. Click **"Upload QR Code"**
5. QR code is saved and displayed to students

### Updating QR Code

1. Click **"Settings"** in sidebar
2. Upload new QR code image
3. Old QR code is replaced
4. Students see new QR code immediately

---

## Viewing Archived Items

### Accessing Archived Courses

1. Click **"Archived"** in sidebar
2. See all archived courses
3. Click on a course to see its exams
4. Click on an exam to see student submissions

### Archived Data

Archived items include:
- Course details
- Exam details
- Student submissions
- Answer details
- Grade history

---

## Best Practices

### Course Management

1. **Create courses first** — Before creating exams
2. **Add questions carefully** — Ensure correct answers are marked
3. **Test exams** — Take the exam yourself before publishing
4. **Publish strategically** — Publish when students are ready

### Enrollment Management

1. **Review promptly** — Don't make students wait
2. **Verify payments** — Check transaction references
3. **Communicate clearly** — Use admin remarks when rejecting
4. **Be fair** — Apply rules consistently

### Grading

1. **Grade promptly** — Don't let submissions pile up
2. **Be consistent** — Apply same standards to all students
3. **Provide feedback** — Use admin remarks when helpful
4. **Double-check** — Review before submitting grades

### Student Management

1. **Monitor progress** — Check student results regularly
2. **Unlock fairly** — Consider each case individually
3. **Communicate** — Inform students of decisions
4. **Document** — Keep records of unlock decisions

---

## Troubleshooting

### Course Not Showing for Students

- Check if course is published
- Check if course is active
- Check if course is archived
- Verify student has approved enrollment

### Exam Not Loading for Students

- Check if exam is published
- Check if exam is active
- Check if exam has questions
- Verify student has approved enrollment

### Grading Not Working

- Check if submission is pending
- Verify marks don't exceed limits
- Check if all questions are graded
- Try refreshing the page

### Locked Student Can't Be Unlocked

- Check enrollment status
- Verify admin has permission
- Try refreshing the page
- Check backend logs

### QR Code Not Showing

- Verify QR code is uploaded
- Check image format (PNG or JPEG)
- Try different browser
- Check backend logs

---

## Security Best Practices

1. **Keep admin code secret** — Don't share with unauthorized users
2. **Use strong passwords** — Minimum 6 characters, mix of letters/numbers
3. **Don't share admin accounts** — Each admin should have own account
4. **Log out when done** — Don't leave admin sessions open
5. **Monitor activity** — Check transaction history regularly

---

## Support

### Getting Help

1. Check this guide first
2. Check backend logs for errors
3. Contact system administrator
4. Report issues on GitHub

### Reporting Issues

When reporting issues, include:
- What you were doing
- What happened
- What you expected
- Error messages
- Browser and device info
