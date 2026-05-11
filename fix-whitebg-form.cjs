const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// Plastic config: remove "Màu Sắc"
code = code.replace(
`                  <div>
                    <label className="block text-[9px] font-bold text-white uppercase mb-1">Màu Sắc</label>
                    <input type="text" placeholder="Pastel Pink, Emerald Green, Minimalist White..." className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none" value={settings.whiteBGPlasticConfig?.color || ''} onChange={e => setSettings({...settings, whiteBGPlasticConfig: {...settings.whiteBGPlasticConfig!, color: e.target.value}})} />
                  </div>\n`, ''
);

// Plastic config: change lighting label
code = code.replace(
`<label className="block text-[9px] font-bold text-white uppercase mb-1">Loại Đèn</label>
                    <input type="text" placeholder="Softbox, Octabox..." className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none" value={settings.whiteBGPlasticConfig?.lighting || ''} onChange={e => setSettings({...settings, whiteBGPlasticConfig: {...settings.whiteBGPlasticConfig!, lighting: e.target.value}})} />`,
`<label className="block text-[9px] font-bold text-white uppercase mb-1">Cường độ ánh sáng</label>
                    <input type="text" placeholder="Mềm, gắt..." className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none" value={settings.whiteBGPlasticConfig?.lighting || ''} onChange={e => setSettings({...settings, whiteBGPlasticConfig: {...settings.whiteBGPlasticConfig!, lighting: e.target.value}})} />`
);

// Glass config: change lighting label
code = code.replace(
`<label className="block text-[9px] font-bold text-white uppercase mb-1">Kỹ thuật đèn</label>
                    <input type="text" placeholder="Rim lighting, Dark-field lighting..." className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none" value={settings.whiteBGGlassConfig?.lighting || ''} onChange={e => setSettings({...settings, whiteBGGlassConfig: {...settings.whiteBGGlassConfig!, lighting: e.target.value}})} />
                    <p className="text-[8px] text-white mt-1">Rim lighting (Sáng viền) rất quan trọng để không bị lẫn vào nền trắng.</p>`,
`<label className="block text-[9px] font-bold text-white uppercase mb-1">Cường độ ánh sáng</label>
                    <input type="text" placeholder="Mềm, gắt..." className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none" value={settings.whiteBGGlassConfig?.lighting || ''} onChange={e => setSettings({...settings, whiteBGGlassConfig: {...settings.whiteBGGlassConfig!, lighting: e.target.value}})} />`
);

// Ceramic config: change lighting label
code = code.replace(
`<label className="block text-[9px] font-bold text-white uppercase mb-1">Hướng đèn</label>
                    <input type="text" placeholder="45-degree side lighting..." className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none" value={settings.whiteBGCeramicConfig?.lighting || ''} onChange={e => setSettings({...settings, whiteBGCeramicConfig: {...settings.whiteBGCeramicConfig!, lighting: e.target.value}})} />
                    <p className="text-[8px] text-white mt-1">Side lighting tạt ngang làm rõ vân đá/bề mặt.</p>`,
`<label className="block text-[9px] font-bold text-white uppercase mb-1">Cường độ ánh sáng</label>
                    <input type="text" placeholder="Mềm, gắt..." className="w-full bg-[#242526] shadow-sm border border-[#3E4042] border border-[#3E4042] rounded-lg p-2 text-xs text-white outline-none" value={settings.whiteBGCeramicConfig?.lighting || ''} onChange={e => setSettings({...settings, whiteBGCeramicConfig: {...settings.whiteBGCeramicConfig!, lighting: e.target.value}})} />`
);

fs.writeFileSync('App.tsx', code);
console.log('App.tsx updated.');
