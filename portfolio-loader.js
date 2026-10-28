async function loadPortfolio(category, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const repoUser = 'muhamaddanu';
  const repoName = 'portfolio';

  try {
    const res = await fetch(`https://api.github.com/repos/${repoUser}/${repoName}/contents/content/${category}`);
    const files = await res.json();

    if (!Array.isArray(files)) return;

    container.innerHTML = ''; 

    for (const file of files) {
      if (file.name.endsWith('.md')) {
        const rawUrl = `https://raw.githubusercontent.com/${repoUser}/${repoName}/main/content/${category}/${file.name}`;
        const rawRes = await fetch(rawUrl);
        const rawText = await rawRes.text();

        const parts = rawText.split('---');
        if (parts.length >= 3) {
          const data = jsyaml.load(parts[1]);

          const toolsText = data.software || data.description || '';
          
          let coverImagePath = data.image || '';
          if (coverImagePath.startsWith('/')) {
            coverImagePath = coverImagePath.substring(1);
          }

          let bundleImages = data.images || [];
          bundleImages = bundleImages.map(img => img.startsWith('/') ? img.substring(1) : img);
          if (bundleImages.length === 0 && coverImagePath) {
            bundleImages = [coverImagePath];
          }

          const safeTitle = (data.title || '').replace(/'/g, "\\'");
          const safeDesc = toolsText.replace(/'/g, "\\'");
          
          // Ubah array gambar ke JSON string untuk dikirim ke fungsi modal
          const jsonImages = JSON.stringify(bundleImages);

          const cardHtml = `
            <div 
              onclick="const rootEl = document.querySelector('[x-data]'); if(rootEl && rootEl.__x) { rootEl.__x.$data.openModal(${jsonImages.replace(/"/g, '&quot;')}, '${safeTitle}', '${safeDesc}') } else { window.openModalGlobal && window.openModalGlobal(${jsonImages.replace(/"/g, '&quot;')}, '${safeTitle}', '${safeDesc}') }"
              class="group relative overflow-hidden rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900 cursor-pointer hover:ring-2 hover:ring-zinc-400 dark:hover:ring-zinc-600 transition"
            >
              <div class="overflow-hidden rounded-lg aspect-square bg-zinc-200 dark:bg-zinc-800">
                <img
                  src="${coverImagePath}"
                  alt="${data.title || 'Karya'}"
                  loading="lazy"
                  class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div class="mt-4 flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-zinc-900 dark:text-zinc-100">
                    ${data.title || ''}
                  </h3>
                  <p class="text-sm text-zinc-500 dark:text-zinc-400">
                    ${toolsText}
                  </p>
                </div>
                <span class="text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded-full font-medium">
                  ${bundleImages.length} Foto
                </span>
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