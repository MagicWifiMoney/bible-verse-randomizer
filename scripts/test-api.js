const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function testAPI() {
  console.log('🔑 Testing Anthropic API key...\n');
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say "API key working!" in JSON format: {"status": "..."}'
      }]
    });
    
    console.log('✅ API Response:', message.content[0].text);
    console.log('📊 Tokens used:', message.usage);
    console.log('\n✅ API key is valid and working!\n');
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    process.exit(1);
  }
}

testAPI();
