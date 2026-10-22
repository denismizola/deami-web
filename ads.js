(() => {
	const adContainers = [...document.querySelectorAll("[data-ad-placement]")];
	if (!adContainers.length) return;

	fetch("ads-config.json")
		.then(response => {
			if (!response.ok) throw new Error("Ads configuration unavailable");
			return response.json();
		})
		.then(config => {
			if (!/^ca-pub-\d{16}$/.test(config.publisherId || "")) return;

			const configuredAds = adContainers.flatMap(container => {
				const slot = config.slots?.[container.dataset.adPlacement];
				if (!/^\d{6,20}$/.test(slot || "")) return [];
				return [{ container, slot }];
			});
			if (!configuredAds.length) return;

			for (const { container, slot } of configuredAds) {
				const ad = document.createElement("ins");
				ad.className = "adsbygoogle";
				ad.style.display = "block";
				ad.dataset.adClient = config.publisherId;
				ad.dataset.adSlot = slot;
				ad.dataset.adFormat = "auto";
				ad.dataset.fullWidthResponsive = "true";
				container.append(ad);
			}

			const script = document.createElement("script");
			script.async = true;
			script.crossOrigin = "anonymous";
			script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.publisherId)}`;
			script.onload = () => {
				for (const { container } of configuredAds) {
					container.hidden = false;
					try {
						(window.adsbygoogle = window.adsbygoogle || []).push({});
					} catch {
						container.hidden = true;
					}
				}
			};
			script.onerror = () => configuredAds.forEach(({ container }) => { container.hidden = true; });
			document.head.append(script);
		})
		.catch(() => adContainers.forEach(container => { container.hidden = true; }));
})();