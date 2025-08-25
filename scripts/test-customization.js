// Test script for AI-driven customization
// Applied Rules: Context First, Clean Code

const testCustomization = async () => {
  console.log('🧪 Testing AI-driven customization system...\n');
  console.log('⚠️  AI IS DISABLED - NO CREDITS WILL BE USED\n');

  const testTopics = [
    'basketball',
    'javascript programming',
    'oil painting',
    'quantum physics',
    'digital marketing'
  ];

  for (const topic of testTopics) {
    console.log(`\n📚 Testing topic: "${topic}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
                 body: JSON.stringify({
           topic,
           skillLevel: 'beginner',
           timeCommitment: 'flexible',
           aiEnabled: false, // DISABLED - NO CREDIT USAGE
         }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.customization) {
          console.log('✅ Customization data received:');
          console.log(`   Category: ${data.customization.category}`);
          console.log(`   Font: ${data.customization.font}`);
          console.log(`   Icon: ${data.customization.icon}`);
          console.log(`   Accent Color: ${data.customization.accentColor}`);
          console.log(`   Background: ${data.customization.background}`);
        } else {
          console.log('❌ No customization data in response');
        }
        
        console.log(`   Topic: ${data.topic}`);
        console.log(`   Milestones: ${data.milestones?.length || 0}`);
      } else {
        console.log('❌ API request failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
};

// Run the test
testCustomization().catch(console.error);
