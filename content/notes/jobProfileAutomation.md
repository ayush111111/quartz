---
title: "Automating Job board Profile Updates"
date: 2025-10-23
assisted: prose
assistedNote: "The project is mine. An LLM expanded my README into this write-up."
tags:
    - github-actions
    - notes
    - cookies
---
# Automating Job board Profile Updates

## What This Project Does

A Python automation framework that keeps your Naukri profile fresh by automatically logging in daily and managing skills, helping job seekers maintain an active presence without manual intervention.

### The Core Motivation
Naukri.com's algorithm prioritizes profiles with daily logins and recent updates, bubbling them up in recruiter searches.

## Challenges Faced
The main obstacle was implementing a robust authentication system:

### Authentication & Session Management
- **Cookie persistence architecture**: Implemented GitHub Actions artifact system to save and reuse authentication cookies between scheduled runs, eliminating repeated login challenges. (First login requires an OTP which creates the otl cookie. The saved cookie is valid for 399 days.)

## Verification: It Actually Works!

The automation was verified by **checking the "Last Updated" timestamp on the Naukri profile** after successful runs. When the bot completes its daily login and skill refresh, the profile's "Last Updated" date changes to the current date, confirming that:
- The login authentication is working correctly
- The session persists through cookie reuse
- The profile interaction triggers Naukri's update detection
- The profile appears "active" to recruiters and the platform algorithm

Since Naukri.com shows **recruiter views as a metric**, I will be observing this number over time to measure whether the daily automated updates lead to improved profile visibility and more recruiter engagement.

---

*Built with Python, Selenium, and GitHub Actions to keep the job search active.*
https://github.com/ayush111111/profile-automation-job

P.S it was hilarious to work with a file called cookie dot pickle.
