const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// 1. Change the chatModel state to chatMode
code = code.replace(/const \[chatModel, setChatModel\] = useState<string>\('gemini-2.5-flash'\);/g, "const [chatMode, setChatMode] = useState<'text' | 'image'>('text');");
code = code.replace(/const \[chatModel, setChatModel\] = useState\('gemini-2.5-flash'\);/g, "const [chatMode, setChatMode] = useState<'text' | 'image'>('text');");

// 2. Fix the handleSendMessage logic
const handleSendMessageStr = `      if (chatModel.includes('flash-image') || chatModel === 'imagen-3.0-generate-002' || chatModel.includes('generate')) {`;
const handleSendMessageOriginal = `      if (chatModel.includes('flash-image')) {`;

code = code.replace(handleSendMessageOriginal, `      if (chatMode === 'image') {`);
// Also in case it was modified before:
code = code.replace(/if \(chatModel\.includes\('image'\)\) \{/g, `if (chatMode === 'image') {`);
// If the call to generateImageForChat passes chatModel:
// const imageUrl = await generateImageForChat(fullPrompt, chatModel, chatImageAspectRatio, chatInputImageBase64 || undefined);
// we change it to map from chatImageQuality.
const genImageChatRegex = /const imageUrl = await generateImageForChat\(fullPrompt, chatModel, chatImageAspectRatio, chatInputImageBase64 \|\| undefined\);/;
const genImageChatNew = `const resolvedModel = chatImageQuality === '4K' ? 'imagen-3.0-generate-002' : 'gemini-3.5-flash';
        const imageUrl = await generateImageForChat(fullPrompt, resolvedModel, chatImageAspectRatio, chatInputImageBase64 || undefined);`;
code = code.replace(genImageChatRegex, genImageChatNew);

// and in text chat:
// const replyText = await chatWithAI(messagesToSend, chatModel);
const textChatRegex = /const replyText = await chatWithAI\(messagesToSend, chatModel\);/;
const textChatNew = `const replyText = await chatWithAI(messagesToSend, 'gemini-3.5-flash');`;
code = code.replace(textChatRegex, textChatNew);

// 3. Update the UI dropdowns
// Find the block:
/*
                <span className="text-xs text-white font-semibold">Mô hình:</span>
                <select 
                  value={chatModel}
                  onChange={e => setChatModel(e.target.value)}
                  className="bg-[#18191A] border-none rounded-md px-3 py-1.5 text-sm outline-none text-white font-medium focus:ring-1 focus:ring-[#1877F2] cursor-pointer"
                >
                  <option value="gemini-2.5-flash">Imagen 3.0 Fast Flash (Chat)</option>
                  <option value="gemini-2.5-pro">Imagen 3.0 Pro (Chat)</option>
                  <option value="gemini-2.5-flash">Imagen 3.0 Flash (Chat)</option>
                  <option value="gemini-3.5-flash">Imagen 3.0 Fast</option>
                  <option value="imagen-3.0-generate-002">Imagen 3.0 Generate</option>
                </select>
*/
const chatModelUIRegex = /<span className="text-xs text-white font-semibold">Mô hình:<\/span>[\s\S]*?<\/select>/;
const chatModeUIRep = `<span className="text-xs text-white font-semibold">Chế độ:</span>
                <select 
                  value={chatMode}
                  onChange={e => setChatMode(e.target.value as 'text' | 'image')}
                  className="bg-[#18191A] border-none rounded-md px-3 py-1.5 text-sm outline-none text-white font-medium focus:ring-1 focus:ring-[#1877F2] cursor-pointer"
                >
                  <option value="text">Trò chuyện AI (Văn bản)</option>
                  <option value="image">Tạo/Sửa ảnh (AI Image)</option>
                </select>`;
code = code.replace(chatModelUIRegex, chatModeUIRep);

// Update {chatModel.includes('image') && (
code = code.replace(/\{chatModel\.includes\('image'\) && \(/g, "{chatMode === 'image' && (");

// 4. Update the intro text
const pRegex = /<p className="text-sm text-center max-w-lg">[\s\S]*?<\/p>/;
const newP = `<p className="text-sm text-center max-w-lg">
                  Tải lên hình để AI tư vấn thiết kế bằng chữ (chọn chế độ Trò chuyện).<br/>
                  Để tạo/sửa ảnh, tải hình lên, viết yêu cầu, và chọn chế độ Tạo ảnh.
                </p>`;
code = code.replace(pRegex, newP);

fs.writeFileSync('App.tsx', code);
console.log("Updated Chat UI models");
