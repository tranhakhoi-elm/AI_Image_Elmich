const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

// Replace standard useState for chatSessions
content = content.replace(
  /const \[chatSessions, setChatSessions\] = useState<ChatSession\[\]>\(\(\) => \{[\s\S]*?\}\);\s*const/m,
  `const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isChatLoaded, setIsChatLoaded] = useState(false);

  useEffect(() => {
    import('localforage').then((localforage) => {
      localforage.default.getItem('elmich_ai_chat_sessions').then((saved) => {
        if (saved) {
           const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved as ChatSession[];
           setChatSessions(parsed);
        }
        setIsChatLoaded(true);
      });
    }).catch(e => {
       console.error('Failed to load chat sessions', e);
       setIsChatLoaded(true);
    });
  }, []);

  const`
);

// Replace save chatSessions
content = content.replace(
  /useEffect\(\(\) => \{\s*localStorage\.setItem\('elmich_ai_chat_sessions', JSON\.stringify\(chatSessions\)\);\s*\}, \[chatSessions\]\);/g,
  `useEffect(() => {
    if (isChatLoaded) {
      import('localforage').then((localforage) => {
        localforage.default.setItem('elmich_ai_chat_sessions', chatSessions).catch((e: any) => {
          console.error('Lỗi khi lưu chat vào localForage:', e);
        });
      });
    }
  }, [chatSessions, isChatLoaded]);`
);


fs.writeFileSync('App.tsx', content);
