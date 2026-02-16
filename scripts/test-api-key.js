/**
 * Test Anthropic API Key
 */

const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function testAPI() {
  console.log('🧪 Testing Anthropic API key...\n');
  console.log(`API Key: ${process.env.ANTHROPIC_API_KEY?.substring(0, 20)}...`);
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say "API key works!" and nothing else.'
      }]
    });
    
    console.log('\n✅ API Key is valid!');
    console.log(`Response: ${message.content[0].text}`);
    console.log(`\nModel: ${message.model}`);
    console.log(`Tokens used: ${message.usage.input_tokens} input, ${message.usage.output_tokens} output`);
    
  } catch (error) {
    console.error('\n❌ API Key test failed:');
    console.error(`Error: ${error.message}`);
    console.error(`Status: ${error.status || 'unknown'}`);
    
    if (error.status === 401) {
      console.error('\n💡 The API key is invalid or expired. You need to:');
      console.error('   1. Get a new API key from https://console.anthropic.com/');
      console.error('   2. Update ANTHROPIC_API_KEY in .env.local');
    } else if (error.status === 429) {
      console.error('\n💡 Rate limited. Wait a few moments and try again.');
    }
  }
}

testAPI();
