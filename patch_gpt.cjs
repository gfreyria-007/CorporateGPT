const fs = require('fs');
let f = fs.readFileSync('src/components/GPTsGenerator.tsx', 'utf8');

// Normalize to LF for matching
const normalized = f.replace(/\r\n/g, '\n');

// Find the placeholder text
const askIdx = normalized.indexOf('Ask ${name}...');
if (askIdx === -1) {
  console.log('Ask placeholder not found');
  // Search what's in preview section
  const previewIdx = normalized.indexOf('Preview Side');
  console.log('Preview section:', JSON.stringify(normalized.substring(previewIdx, previewIdx + 400)));
  process.exit(1);
}

// Replace placeholder and add onKeyDown
let patched = normalized.replace(
  'placeholder={`Ask ${name}...`}',
  'placeholder={`Pregunta a ${name}...`}\n                                onKeyDown={(e) => e.key === \'Enter\' && handlePreviewSend()}'
);

// Add Send button after input closing /> and before closing divs of the chat motion.div
const target = '                              />\n                           </div>\n                        </div>\n                     </motion.div>';
const replacement = `                              />
                              <button
                                onClick={handlePreviewSend}
                                disabled={!previewInput.trim() || isPreviewLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-blue-600 disabled:bg-slate-300 rounded-full flex items-center justify-center text-white transition-all hover:bg-blue-700"
                              >
                                {isPreviewLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                              </button>
                           </div>
                        </div>
                        {previewResponse && (
                          <div className="mt-3 p-4 rounded-2xl text-sm font-medium leading-relaxed bg-slate-50 border border-slate-100 text-slate-700">
                            {previewResponse}
                          </div>
                        )}
                     </motion.div>`;

if (patched.includes(target)) {
  patched = patched.replace(target, replacement);
  console.log('Send button added OK');
} else {
  console.log('Target closing div pattern not found');
  const inputIdx = patched.indexOf('previewInput}');
  console.log('Around input:', JSON.stringify(patched.substring(inputIdx, inputIdx + 300)));
}

// Write back with CRLF
fs.writeFileSync('src/components/GPTsGenerator.tsx', patched.replace(/\n/g, '\r\n'));
console.log('File written.');
