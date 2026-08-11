const ngrok = require('@ngrok/ngrok');
const fs = require('fs');

(async () => {
  try {
    const authtoken = '3BCmh1ccNrQbGTJuKW92kU2rh4k_7ynY2bB7R3BnR8FbArS2';
    
    // Establish ngrok tunnel using official @ngrok/ngrok SDK
    const listener = await ngrok.forward({
      addr: 5000,
      authtoken: authtoken,
    });

    const publicUrl = listener.url();

    console.log('==================================================');
    console.log('NGROK TUNNEL CREATED SUCCESSFULLY!');
    console.log('Public Backend URL:', publicUrl);
    console.log('Backend API Base:', `${publicUrl}/api`);
    console.log('==================================================');

    fs.writeFileSync('ngrok-url.txt', `Backend API: ${publicUrl}/api\nPublic URL: ${publicUrl}\n`, 'utf8');

    // Keep process alive
    process.stdin.resume();
  } catch (error) {
    console.error('Failed to create ngrok tunnel:', error);
    process.exit(1);
  }
})();
