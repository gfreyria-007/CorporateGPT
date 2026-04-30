import dotenv from 'dotenv';
dotenv.config();

console.log('--- API KEY CHECK ---');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `Found (ends in ...${process.env.GEMINI_API_KEY.slice(-4)})` : 'MISSING');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? `Found (ends in ...${process.env.OPENROUTER_API_KEY.slice(-4)})` : 'MISSING');
console.log('---------------------');
