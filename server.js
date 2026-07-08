const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve frontend static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

const WISHES_FILE = path.join(__dirname, 'wishes.json');
const IMAGES_DIR = path.join(__dirname, 'public', 'images');

// API: Get memories database
app.get('/api/memories', async (req, res) => {
  try {
    const files = await fs.readdir(IMAGES_DIR);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    const photoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    const chaptersMap = {};

    for (const filename of photoFiles) {
      const parts = filename.split('_');
      let category = 'family';
      let caption = 'Dad and Family';

      if (parts.length >= 2) {
        const catPart = parts[0].toLowerCase();
        if (catPart.includes('burst') || catPart.includes('cover')) {
          category = 'legacy';
          caption = 'Our Legacy';
        } else if (catPart.includes('snapchat')) {
          category = 'moments';
          caption = 'Happy Moments';
        } else if (filename.startsWith('IMG2018') || filename.startsWith('IMG2020') || filename.startsWith('IMG2021')) {
          category = 'legacy';
          caption = 'Beautiful Legacy';
        } else if (filename.startsWith('IMG2025') || filename.startsWith('IMG2026')) {
          category = 'moments';
          caption = 'Cherished Moments';
        }
      }

      if (!chaptersMap[category]) {
        let chTitle = "Loving Memories";
        let chDesc = "Beautiful times spent together";
        
        if (category === 'legacy') {
          chTitle = "The Pillars of Strength";
          chDesc = "Timeless memories of Dad's early days and guidance";
        } else if (category === 'moments') {
          chTitle = "Moments of Joy";
          chDesc = "Laughter, celebrations, and sweet daily moments";
        } else {
          chTitle = "Our Loving Family";
          chDesc = "The warmth of home and family bonding";
        }

        chaptersMap[category] = {
          id: category,
          title: chTitle,
          description: chDesc,
          photos: []
        };
      }

      chaptersMap[category].photos.push({
        src: `images/${filename}`,
        caption: caption,
        date: "Loving Memory"
      });
    }

    const gratitudes = [
      {
        "title": "ನಿನ್ನ ನೆರಳು (Your Shadow)",
        "text": "ಹುಟ್ಟಿದಾಗಿನಿಂದ ಇಂದಿನವರೆಗೂ ನಾನು ನಿನ್ನ ನೆರಳಲ್ಲೇ ಬೆಳೆದೆ. ನನ್ನ ಮೊದಲ ಹೆಜ್ಜೆಯಿಂದ ಹಿಡಿದು ಇಂದು ನಾನು ನಿಂತಿರುವ ಈ ಹಂತದವರೆಗೂ, ಪ್ರತಿಯೊಂದು ಹೆಜ್ಜೆಯಲ್ಲೂ ನಿನ್ನ ಕೈ ನನ್ನ ಬೆನ್ನಿಗಿತ್ತು. ಎಂದಿಗೂ ನನ್ನನ್ನು ಬೈಯಲಿಲ್ಲ, ಎಂದೂ ಜೋರಾಗಿ ಮಾತನಾಡಲಿಲ್ಲ. ತಾಳ್ಮೆಯಿಂದ ಕುಳಿತು ಸರಿ ತಪ್ಪುಗಳನ್ನು ತಿಳಿಸಿಕೊಟ್ಟೆ. ಬೈಯದೆ ಬೆಳೆಸಿದೆ, ಬಡಿಯದೆ ತಿದ್ದಿ ತೀಡಿದೆ, ಮೌನದಲ್ಲೇ ಎಷ್ಟೋ ಜೀವನದ ಪಾಠಗಳನ್ನು ಕಲಿಸಿದೆ.",
        "audio": "audio/track2.mp3"
      },
      {
        "title": "ನಮ್ಮ ನಾಯಕ (Our Hero)",
        "text": "ಅಜ್ಜಿಗೆ ನೀನು ಸತ್ಪುತ್ರ, ಅಮ್ಮನಿಗೆ ಒಳ್ಳೆಯ ಪತಿ, ನನಗೂ ಮತ್ತು ತಂಗಿಗೂ ನೀನೇ ಆಶ್ರಯ, ಸುರಕ್ಷತೆ ಹಾಗೂ ನಮ್ಮ ಹೆಮ್ಮೆಯ ಮನೆ. ಪ್ರತಿ ಮನೆಯಲ್ಲೂ ಒಬ್ಬ ನಾಯಕ ಇರುತ್ತಾನೆ ಎನ್ನುತ್ತಾರೆ. ಆದರೆ ನಮ್ಮ ಬದುಕಿನ ನಿಜವಾದ ನಾಯಕ ನೀನೇ ಅಪ್ಪ. ಜೀವನದಲ್ಲಿ ಎಷ್ಟೇ ಕಷ್ಟದ ಗಾಳಿ-ಮಳೆ, ಬಿರುಗಾಳಿ ಅಪ್ಪಳಿಸಿದರೂ, ನೀನು ಆಲದ ಮರದಂತೆ ಭದ್ರವಾಗಿ ನಿಂತೆ. ನಮ್ಮ ಮೇಲೆ ಯಾವುದೇ ನೋವಿನ ನೆರಳು ಬೀಳದಂತೆ ಕಾಪಾಡಿದೆ. ಎಷ್ಟೋ ಬಾರಿ ನೀನು ದಣಿದು ಮನೆಗೆ ಬಂದಾಗಲೂ, ಮನಸ್ಸಿನಲ್ಲಿ ಸಾವಿರ ಚಿಂತೆಗಳಿದ್ದರೂ, ನಮ್ಮ ಮುಂದೆ ಆ ಭಾರವನ್ನು ಎಂದೂ ತೋರಿಸಿಕೊಳ್ಳಲಿಲ್ಲ.",
        "audio": "audio/track3.mp3"
      },
      {
        "title": "ನಿನ್ನ ತ್ಯಾಗ (Your Sacrifice)",
        "text": "ನಿನ್ನ ಆಸೆ-ಕನಸುಗಳನ್ನು ಬದಿಗೊತ್ತಿ, ನಮ್ಮ ಕನಸುಗಳನ್ನು ಎತ್ತಿ ಹಿಡಿದೆ. ಜೇಬು ಖಾಲಿಯಾಗಿದ್ದರೂ ಮುಖದಲ್ಲಿ ನಗು ಇರುತ್ತಿತ್ತು, ಮನಸ್ಸಿಗೆ ನೋವಾದರೂ ಎಂದೂ ನಮಗೆ ತೋರಿಸಿಕೊಳ್ಳಲಿಲ್ಲ. ನಮ್ಮ ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕಾಗಿ, ಭವಿಷ್ಯಕ್ಕಾಗಿ ನಿನ್ನ ವೈಯಕ್ತಿಕ ಆಸೆಗಳನ್ನೆಲ್ಲ ಬದಿಗಿಟ್ಟೆ. ನಿನಗೆ ಬೇಕಾದ್ದನ್ನು ಕೊಳ್ಳದೆ ನಮಗೆ ಕೇಳಿದ್ದನ್ನೆಲ್ಲ ಕೊಡಿಸಿದೆ. ಈಗ ಯೋಚಿಸಿದಾಗ ಅಪ್ಪ, ನಿನ್ನ ತ್ಯಾಗದ ಆಳ ನನಗೆ ಪೂರ್ತಿಯಾಗಿ ಅರ್ಥವಾಗುತ್ತಿದೆ.",
        "audio": "audio/track4.mp3"
      },
      {
        "title": "ನಿನ್ನ ಮಾರ್ಗದರ್ಶನ (Your Guidance)",
        "text": "ನನ್ನ ಸಣ್ಣ ಪುಟ್ಟ ತಪ್ಪುಗಳಿಗೂ ನೀನು ಎಂದಿಗೂ ಕೋಪಗೊಳ್ಳಲಿಲ್ಲ. ಪ್ರೀತಿಯಿಂದಲೇ ನನ್ನನ್ನು ತಿದ್ದಿ ಮುನ್ನಡೆಸಿದೆ. ನನ್ನ ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕಾಗಿ ನಿನ್ನ ವೈಯಕ್ತಿಕ ಕನಸುಗಳನ್ನೆಲ್ಲ ಬದಿಗಿಟ್ಟು ನಮ್ಮನ್ನೇ ಬೆಳೆಸಿದೆ. ಈಗ ಯೋಚಿಸಿದಾಗ ಅಪ್ಪ, ನಿನ್ನ ಪ್ರತಿಯೊಂದು ತ್ಯಾಗದ ಬೆಲೆ ನನಗೆ ಅರಿವಾಗುತ್ತಿದೆ.",
        "audio": "audio/track5.mp3"
      },
      {
        "title": "ನನ್ನ ಗೆಲುವು (My Success)",
        "text": "ನನ್ನ ಜೀವನದ ಪ್ರತಿಯೊಂದು ಸಣ್ಣ ಗೆಲುವಿನಲ್ಲೂ ನಿನ್ನ ಬೆಂಬಲವೇ ದೊಡ್ಡ ಶಕ್ತಿಯಾಗಿತ್ತು. ನಾನು ಸಾಧಿಸಿದಾಗ ನಿನ್ನ ಕಣ್ಣಲ್ಲಿ ಮೂಡುವ ಆ ಹೆಮ್ಮೆಯ ಮಿಂಚಿದೆಯಲ್ಲ ಅಪ್ಪ, ಅದೇ ನನ್ನ ಪಾಲಿನ ದೊಡ್ಡ ಯಶಸ್ಸು. ನಿನ್ನ ನಗುಮುಖವೇ ನನ್ನ ಬದುಕಿನ ಶ್ರೇಷ್ಠ ಕಾಣಿಕೆ.",
        "audio": "audio/track6.mp3"
      },
      {
        "title": "ನನ್ನ ಹೆಮ್ಮೆ (My Pride)",
        "text": "ಅಪ್ಪ, ನಿನ್ನ ಮಗಳಾಗಿ ಹುಟ್ಟಿದ್ದೇ ನನ್ನ ಜನ್ಮದ ಪುಣ್ಯ. ನಿನ್ನ ಅರ್ಧದಷ್ಟಾದರೂ ನಿಸ್ವಾರ್ಥತೆ, ಧೈರ್ಯ ಮತ್ತು ಒಳ್ಳೆಯತನವನ್ನು ನಾನು ರೂಢಿಸಿಕೊಂಡರೆ ಸಾಕು. ನೀನು ಎಂದೂ ದೊಡ್ಡ ಉಪದೇಶಗಳನ್ನು ಮಾಡಲಿಲ್ಲ, ಆದರೆ ನಿನ್ನ ಪ್ರತಿ ನಡತೆಯೂ ನನಗೊಂದು ಆದರ್ಶ ಪಾಠವಾಗಿತ್ತು. ನಿನ್ನ ಪ್ರೀತಿ ಎಂದೂ ಶಬ್ದಗಳಲ್ಲಿ ವ್ಯಕ್ತವಾಗಲಿಲ್ಲ; ಅದು ನಿನ್ನ ಮೌನದಲ್ಲಿ, ತ್ಯಾಗದಲ್ಲಿ ಮತ್ತು ನಮ್ಮ ಮೇಲಿನ ಕಾಳಜಿಯಲ್ಲಿತ್ತು. ಕಣ್ಣಿಗೆ ಕಾಣದ ದೇವರಿಗಿಂತ ಅಪ್ಪನ ರೂಪದಲ್ಲಿರುವ ನೀನೇ ನನಗೆ ಸರ್ವಸ್ವ. ನಿನ್ನ ಮಗಳಾಗಿರುವುದೇ ನನ್ನ ಬದುಕಿನ ಅತ್ಯಂತ ಹೆಮ್ಮೆಯ ವಿಷಯ.",
        "audio": "audio/track7.mp3"
      }
    ];

    const chapters = Object.values(chaptersMap);
    res.json({ chapters, gratitudes });
  } catch (error) {
    console.error('Error scanning images directory:', error);
    res.status(500).json({ error: 'Failed to retrieve memory data.' });
  }
});

// API: Get Wishes Board
app.get('/api/wishes', async (req, res) => {
  try {
    const data = await fs.readFile(WISHES_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.json([]);
  }
});

// API: Post new Wish
app.post('/api/wishes', async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) {
      return res.status(400).json({ error: 'Name and text are required.' });
    }

    let wishes = [];
    try {
      const data = await fs.readFile(WISHES_FILE, 'utf8');
      wishes = JSON.parse(data);
    } catch (e) {
      // Empty list
    }

    const newWish = {
      id: Date.now(),
      name,
      text
    };

    wishes.push(newWish);
    await fs.writeFile(WISHES_FILE, JSON.stringify(wishes, null, 2), 'utf8');
    res.status(201).json(newWish);
  } catch (error) {
    console.error('Error writing wish:', error);
    res.status(500).json({ error: 'Failed to save wish.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
