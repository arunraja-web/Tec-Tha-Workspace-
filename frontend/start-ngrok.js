import ngrok from '@ngrok/ngrok';
import fs from 'fs';

(async () => {
  try {
    const authtoken = '3BCmh1ccNrQbGTJuKW92kU2rh4k_7ynY2bB7R3BnR8FbArS2';

    // Establish ngrok tunnel for Frontend (port 5173)
    const listener = await ngrok.forward({
      addr: 5173,
      authtoken: authtoken,
    });

    const publicUrl = listener.url();

    console.log('==================================================');
    console.log('🚀 FRONTEND NGROK TUNNEL CREATED SUCCESSFULLY!');
    console.log('Public Frontend URL:', publicUrl);
    console.log('==================================================');

    fs.writeFileSync('ngrok-url.txt', `Frontend Public URL: ${publicUrl}\n`, 'utf8');

    // Keep process alive
    process.stdin.resume();
  } catch (error) {
    if (error.errorCode === 'ERR_NGROK_334' || (error.message && error.message.includes('already online'))) {
      console.error('==================================================');
      console.error('⚠️ NGROK TUNNEL CONFLICT (ERR_NGROK_334)');
      console.error('Your free Ngrok static domain is currently occupied by an active session.');
      console.error('If all local terminals are closed, this means either:');
      console.error(' 1. A ghost session is still lingering on Ngrok cloud servers (will expire in 3-5 mins).');
      console.error(' 2. The tunnel is running on another device/terminal using your account token.');
      console.error('\n🛠️ HOW TO FIX RIGHT NOW:');
      console.error(' ► Option 1: Go to https://dashboard.ngrok.com/endpoints and click "Stop Endpoint".');
      console.error(' ► Option 2: Wait 3-5 minutes for the Ngrok cloud heartbeat to timeout.');
      console.error(' ► Option 3: Run `npx localtunnel --port 5173` for an instant alternative tunnel.');
      console.error('==================================================');
    } else {
      console.error('Failed to create frontend ngrok tunnel:', error);
    }
    process.exit(1);
  }
})();
