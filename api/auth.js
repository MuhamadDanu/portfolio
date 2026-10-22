module.exports = async (req, res) => {
  const { code } = req.query;

  // Step 1: Redirect user ke GitHub Authorization
  if (!code) {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&scope=repo,user`;
    res.writeHead(302, { Location: githubAuthUrl });
    res.end();
    return;
  }

  try {
    // Step 2: Tukar code dari GitHub dengan Access Token
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code
      })
    });

    const data = await response.json();
    const accessToken = data.access_token;

    if (!accessToken) {
      throw new Error('Gagal mengambil Access Token dari GitHub');
    }

    // Step 3: Kirim token kembali ke Decap CMS
    const content = `
      <!doctype html>
      <html>
        <body>
          <script>
            (function() {
              function receiveMessage(e) {
                console.log("receiveMessage", e);
                window.opener.postMessage(
                  'authorization:github:success:${JSON.stringify({ token: accessToken, provider: 'github' })}',
                  e.origin
                );
              }
              window.addEventListener("message", receiveMessage, false);
              window.opener.postMessage("authorizing:github", "*");
            })();
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send(`Authentication error: ${error.message}`);
  }
};