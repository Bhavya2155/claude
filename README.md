# Magazine Flipbook Website

A professional magazine viewer with flipbook functionality, filtering, and search capabilities.

## Features

- ✅ **Dynamic Filtering**: Filter magazines by Language, Year, and Month
- ✅ **Search Functionality**: Real-time search by magazine title
- ✅ **Flipbook Viewer**: Realistic page-turning animation
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Audio Effects**: Page flip sound effects
- ✅ **Professional UI**: Clean, modern interface matching reference design

## File Structure

```
my-repo-for-flip-book-main/
├── index.html          # Main HTML file
├── script.js           # JavaScript logic (filtering, flipbook)
├── style.css           # Custom styles
├── data.json           # Magazine metadata (EDIT THIS TO ADD MAGAZINES)
├── flip.mp3            # Page flip sound effect
├── books/              # Magazine pages folder
│   ├── book1/          # First magazine
│   │   ├── 1.jpg
│   │   ├── 2.jpg
│   │   └── ... (16.jpg)
│   └── book2/          # Second magazine
│       ├── 1.jpg
│       ├── 2.jpg
│       └── ... (16.jpg)
└── README.md
```

## Adding New Magazines

### Step 1: Add Magazine Images

1. Create a new folder inside `books/` (e.g., `book3`)
2. Add your magazine pages as numbered JPG files: `1.jpg`, `2.jpg`, `3.jpg`, etc.
3. The first image (`1.jpg`) will be used as the cover thumbnail

### Step 2: Update data.json

Open `data.json` and add a new entry:

```json
{
  "id": 3,
  "title": "Your Magazine Title",
  "folder": "book3",
  "pages": 20,
  "language": "English",
  "year": 2025,
  "month": "May",
  "coverImage": "books/book3/1.jpg"
}
```

**Important Notes:**
- `id` must be unique
- `folder` must match your folder name in `books/`
- `pages` must match the total number of JPG files
- `coverImage` should point to the first page

## GitHub Pages Deployment

### Quick Deploy (3 Steps)

1. **Upload to GitHub:**
   - Create a new repository on GitHub
   - Upload all files to the repository
   - Make sure `books/` folder with all images is uploaded

2. **Enable GitHub Pages:**
   - Go to repository **Settings**
   - Navigate to **Pages** (left sidebar)
   - Under **Source**, select `main` branch
   - Click **Save**

3. **Access Your Site:**
   - Your site will be live at: `https://YOUR-USERNAME.github.io/REPO-NAME/`
   - Wait 2-3 minutes for initial deployment

### Troubleshooting

**Images not loading?**
- Verify all paths in `data.json` are correct
- Check that image files are uploaded to GitHub
- Image paths are case-sensitive on GitHub Pages

**Filters not working?**
- Clear browser cache and refresh
- Check browser console for errors (F12)

**Flipbook not opening?**
- Ensure `data.json` has correct page counts
- Verify all numbered images exist (1.jpg through X.jpg)

## Customization

### Change Colors

Edit the Tailwind classes in `index.html`:
- Header color: `text-red-600` (line with `<h1>`)
- Search button: `bg-orange-500` 
- Focus colors: `focus:ring-red-500`

### Change Flipbook Settings

Edit `script.js` around line 118:

```javascript
pageFlip = new St.PageFlip(container, {
    width: 1358,        // Page width
    height: 1004,       // Page height
    flippingTime: 1000, // Animation duration (ms)
    // ... more settings
});
```

### Disable Sound

In `script.js`, comment out line 122-125:

```javascript
// if (flipSound) {
//     flipSound.currentTime = 0;
//     flipSound.play().catch(() => {});
// }
```

## Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Credits

- **PageFlip Library**: [page-flip by nodlik](https://github.com/Nodlik/StPageFlip)
- **Tailwind CSS**: Utility-first CSS framework

## License

Free to use and modify for your projects.
