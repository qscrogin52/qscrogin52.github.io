# Building Blocks Baseball Website

This is a GitHub Pages-ready static website for Building Blocks Baseball.

## Structure

```text
index.html
our-program/index.html
schools/index.html
schools/school.html
parent-faq/index.html
privacy-policy/index.html
contact/index.html
assets/css/styles.css
assets/js/main.js
assets/js/schools.js
assets/images/logo.svg
```

## Local testing

1. Open this folder in VS Code.
2. Install the Live Server extension.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Test desktop, mobile preview, links, and print pages before pushing to GitHub.

## GitHub Pages setup

1. Create a GitHub repo named `building-blocks-baseball`.
2. Upload all files from this folder into the repo.
3. Go to **Settings → Pages**.
4. Set source to **Deploy from branch**.
5. Choose branch `main` and folder `/root`.
6. Save.

Your temporary URL will look like:

```text
https://qscrogin52.github.io/building-blocks-baseball/
```

## Custom domain later

After the site is tested, connect:

```text
buildingblocksbaseballstl.com
www.buildingblocksbaseballstl.com
```

Do this only after the GitHub Pages version is ready.

## Connecting the schools page to Google Sheets

Open:

```text
assets/js/schools.js
```

Find:

```js
csvUrl: '',
```

Replace the blank value with your published Google Sheets CSV URL:

```js
csvUrl: 'https://docs.google.com/spreadsheets/d/e/YOUR-ID/pub?output=csv',
```

The code currently uses sample school data until you add your real CSV link.

## Expected CSV columns

The code is flexible, but this structure is best:

```text
name,slug,city,season,status,ages,day,time,location,address,registrationUrl,notes,schedule
```

Schedule format:

```text
2026-04-07|Week 1;2026-04-14|Week 2;2026-04-21|Week 3
```

Optional schedule note format:

```text
2026-04-07|Week 1|Opening practice;2026-04-14|Week 2
```

If a schedule item contains words like `cancel`, `closed`, or `skip`, it will appear greyed out.

## What to edit first

- Replace `assets/images/logo.svg` with the real logo if needed.
- Update footer links in `assets/js/main.js`.
- Add the real Google Sheets CSV URL in `assets/js/schools.js`.
- Replace the contact placeholder form with your real contact/registration form.
- Review privacy policy before publishing as final legal language.
