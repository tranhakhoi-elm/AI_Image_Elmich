const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const overlay = `      </AnimatePresence>
      <AnimatePresence>
        {(appState === AppState.GENERATING || appState === AppState.ANALYZING) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#000000]/80 backdrop-blur-md pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#242526] border border-[#3E4042] rounded-3xl p-8 max-w-sm w-full mx-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1877F2] to-transparent animate-pulse"></div>
              
              <div className="relative mb-6">
                <div className="w-16 h-16 border-[4px] border-[#18191A] border-t-[#1877F2] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={20} className="text-[#1877F2] animate-pulse" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Đang xử lý</h3>
              <p className="text-[#B0B3B8] font-medium">{loadingMessage || "AI đang làm việc, vui lòng chờ..."}</p>
              
              <div className="mt-8 w-full">
                <div className="h-1.5 w-full bg-[#18191A] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1877F2] w-full animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>`;

content = content.replace(/<\/AnimatePresence>\s*\{viewMode === 'studio'\ ? \(/g, overlay + "\n      {viewMode === 'studio' ? (");
fs.writeFileSync('App.tsx', content);
