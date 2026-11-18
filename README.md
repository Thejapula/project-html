# PeerReviewHub — Peer Review System for Online Learning

A complete, functional static website built with **HTML5, CSS3 and Vanilla JavaScript only** (no frameworks or libraries).

## Run it

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python -m http.server 3000
# then visit http://localhost:3000/index.html
```

Data is stored in the browser's `localStorage`, so the full workflow works without a backend.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Student | `student@prs.edu` | `student123` |
| Reviewer | `reviewer@prs.edu` | `review123` |
| Admin | `admin@prs.edu` | `admin123` |

The login page has one-click buttons to fill these in. Register your own student or reviewer account too.

## Main workflow

`Register → Login → Dashboard → Browse Courses → Enroll → Study Content → Submit Assignment → Peer Assignment → Review Submission → Give Rating & Feedback → Student Receives Feedback → Track Progress`

1. Log in as a student, open **Courses**, search/filter and enroll.
2. Open **Learning Content**, watch/read materials and mark them complete (progress rises).
3. Open **My Submissions** and submit a link or file.
4. Log in as a reviewer (or use the claim queue as any user) in **Peer Reviews**.
5. Claim a pending submission, give a 1–5 star rating plus feedback, and submit.
6. Log back in as the student: the feedback, rating and comments appear on the submission, in Notifications and in Progress.
7. Admin can manage users, courses, content and submissions, and reset demo data.

## Pages

`index.html`, `register.html`, `login.html`, `dashboard.html`, `courses.html`, `content.html`, `submission.html`, `review.html`, `progress.html`, `notifications.html`, `profile.html`, `admin.html`

Shared assets: `css/style.css`, `js/core.js` (data/auth/UI), `js/pages.js` (page logic).

## Notes

- Protected pages redirect to `login.html`; the admin panel is restricted to the admin role.
- "Remember me" keeps the session on the device; logout clears it.
- Uploaded files are stored as data URLs for small files (< 700 KB); larger files keep their filename only.
- Admin → **Reset demo data** restores the original seeded accounts, courses and activity.
