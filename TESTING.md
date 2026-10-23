# Testing Checklist — Faculink

**QA Status:** All functional tests passed prior to submission.

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Student registration | Account created, redirected to home page | ✅ Pass |
| 2 | Student login | Redirected to home page with session active | ✅ Pass |
| 3 | Faculty login | Redirected to `/faculty/dashboard` | ✅ Pass |
| 4 | Admin login | Redirected to `/admin/dashboard` | ✅ Pass |
| 5 | Book consultation | Modal opens, request submitted successfully | ✅ Pass |
| 6 | Double-booking prevention | Second attempt on same slot is blocked | ✅ Pass |
| 7 | Faculty approve request | Status updates to "Approved" | ✅ Pass |
| 8 | Mark as completed | Status updates to "Completed" | ✅ Pass |
| 9 | Cancel pending request | Booking is removed from database | ✅ Pass |
| 10 | Access control (Student) | Student cannot access `/admin/dashboard` (403) | ✅ Pass |
| 11 | Access control (Guest) | Unauthenticated user redirected to `/login` | ✅ Pass |
| 12 | CSRF protection | POST request without token returns 419 error | ✅ Pass |
| 13 | Admin create faculty | New faculty account appears in user list | ✅ Pass |
| 14 | Mobile responsive | Layout stacks correctly on screens < 640px | ✅ Pass |
# Testing Checklist — Faculink

**QA Status:** All functional tests passed prior to submission.

| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Student registration | Account created, redirected to home page | ✅ Pass |
| 2 | Student login | Redirected to home page with session active | ✅ Pass |
| 3 | Faculty login | Redirected to `/faculty/dashboard` | ✅ Pass |
| 4 | Admin login | Redirected to `/admin/dashboard` | ✅ Pass |
| 5 | Book consultation | Modal opens, request submitted successfully | ✅ Pass |
| 6 | Double-booking prevention | Second attempt on same slot is blocked | ✅ Pass |
| 7 | Faculty approve request | Status updates to "Approved" | ✅ Pass |
| 8 | Mark as completed | Status updates to "Completed" | ✅ Pass |
| 9 | Cancel pending request | Booking is removed from database | ✅ Pass |
| 10 | Access control (Student) | Student cannot access `/admin/dashboard` (403) | ✅ Pass |
| 11 | Access control (Guest) | Unauthenticated user redirected to `/login` | ✅ Pass |
| 12 | CSRF protection | POST request without token returns 419 error | ✅ Pass |
| 13 | Admin create faculty | New faculty account appears in user list | ✅ Pass |
| 14 | Mobile responsive | Layout stacks correctly on screens < 640px | ✅ Pass |
