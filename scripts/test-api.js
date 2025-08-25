// Simple test script to verify OpenAI API integration
// Run with: node test-api.js

const testAPI = async () => {
  console.log('🧪 Testing API Integration...\n');

  // Test 1: Curated roadmap (FREE)
  console.log('1️⃣ Testing curated roadmap (React)...');
  try {
    const response1 = await fetch('http://localhost:3000/api/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'React',
        skillLevel: 'beginner',
        timeCommitment: 'flexible'
      })
    });
    
    const data1 = await response1.json();
    console.log('✅ React roadmap loaded successfully');
    console.log(`   Topic: ${data1.topic}`);
    console.log(`   Milestones: ${data1.milestones.length}\n`);
  } catch (error) {
    console.log('❌ React test failed:', error.message);
  }

  // Test 2: OpenAI API (COST: ~$0.03)
  console.log('2️⃣ Testing OpenAI API (Machine Learning)...');
  try {
    const response2 = await fetch('http://localhost:3000/api/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Machine Learning',
        skillLevel: 'beginner',
        timeCommitment: 'flexible',
        aiEnabled: true // Explicitly enable AI for this test
      })
    });
    
    const data2 = await response2.json();
    console.log('✅ Machine Learning roadmap generated successfully');
    console.log(`   Topic: ${data2.topic}`);
    console.log(`   Milestones: ${data2.milestones.length}`);
    console.log(`   Overview: ${data2.overview.substring(0, 100)}...\n`);
  } catch (error) {
    console.log('❌ Machine Learning test failed:', error.message);
  }

  console.log('🎯 Test completed! Check your OpenAI dashboard for usage.');
};

// Run the test
testAPI().catch(console.error);
