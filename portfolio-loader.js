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
            <div class="group relative overflow-hidden rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
              <div class="overflow-hidden rounded-lg aspect-square bg-zinc-200 dark:bg-zinc-800">
                <img
                  src="${imagePath}"
                  alt="${data.title || 'Karya'}"
                  loading="lazy"
                  class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div class="mt-4">
                <h3 class="font-medium text-zinc-900 dark:text-zinc-100">
                  ${data.title || ''}
                </h3>
                <p class="text-sm text-zinc-500 dark:text-zinc-400">
                  ${toolsText}
                </p>
              </div>
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