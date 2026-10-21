async function loadPortfolio(category, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const repoUser = 'muhamaddanu'; // Username GitHub kamu
  const repoName = 'portfolio';   // Nama repositori GitHub kamu

  try {
    const res = await fetch(`https://api.github.com/repos/${repoUser}/${repoName}/contents/content/${category}`);
    const files = await res.json();

    if (!Array.isArray(files)) return;

    container.innerHTML = ''; // Bersihkan kontainer statis

    for (const file of files) {
      if (file.name.endsWith('.md')) {
        const rawRes = await fetch(file.download_url);
        const rawText = await rawRes.text();

        const parts = rawText.split('---');
        if (parts.length >= 3) {
          const data = jsyaml.load(parts[1]);

          // Sesuaikan class kartu dengan struktur CSS kamu
          const cardHtml = `
            <div class="portfolio-card">
              <img src="${data.image}" alt="${data.title}" loading="lazy" />
              <h3>${data.title}</h3>
              <p>${data.software || ''}</p>
            </div>
          `;
          container.innerHTML += cardHtml;
        }
      }
    }
  } catch (err) {
    console.error('Gagal memuat data portofolio:', err);
  }
}