const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

// Replace standard useState for gallery
content = content.replace(
  /const \[gallery, setGallery\] = useState<GeneratedImage\[\]>\(\(\) => \{[\s\S]*?\}\);\s*const/m,
  `const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [isGalleryLoaded, setIsGalleryLoaded] = useState(false);
  const`
);

// We need an effect for initial load
content = content.replace(
  /const \[activeImage, setActiveImage\]/m,
  `useEffect(() => {
    import('localforage').then((localforage) => {
      // Load gallery
      localforage.default.getItem('elmich_ai_gallery').then((saved) => {
        if (saved) {
           const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved as GeneratedImage[];
           const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
           setGallery(parsed.filter((img: any) => img.timestamp > oneWeekAgo));
        }
        setIsGalleryLoaded(true);
      });
    }).catch(e => {
       console.error('Failed to load gallery', e);
       setIsGalleryLoaded(true);
    });
  }, []);

  const [activeImage, setActiveImage]`
);

// Replace save gallery
content = content.replace(
  /useEffect\(\(\) => \{\s*try \{\s*localStorage\.setItem\('elmich_ai_gallery', JSON\.stringify\(gallery\)\);\s*\} catch \(e: any\) \{[\s\S]*?\}\s*\}, \[gallery\]\);/g,
  `useEffect(() => {
    if (isGalleryLoaded) {
      import('localforage').then((localforage) => {
        localforage.default.setItem('elmich_ai_gallery', gallery).catch((e: any) => {
          console.error('Lỗi khi lưu vào localForage:', e);
          setAlertMessage('Bộ nhớ quá tải, không thể lưu thêm ảnh.');
        });
      });
    }
  }, [gallery, isGalleryLoaded]);`
);


fs.writeFileSync('App.tsx', content);
