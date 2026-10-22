(() => {
	function getVideoTitle(filename) {
		return filename.replace(/\.[^.]+$/, "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
	}

	function initializePlayer(container) {
		const picker = container.querySelector("[data-video-library]");
		const fileInput = container.querySelector("[data-video-upload]");
		const player = container.querySelector("[data-internal-video-player]");
		const status = container.querySelector("[data-video-status]");
		let localObjectUrl = "";

		function releaseLocalVideo() {
			if (localObjectUrl) URL.revokeObjectURL(localObjectUrl);
			localObjectUrl = "";
		}

		function setSource(source, title) {
			player.pause();
			if (localObjectUrl && localObjectUrl !== source) {
				URL.revokeObjectURL(localObjectUrl);
				localObjectUrl = "";
			}
			player.src = source;
			player.load();
			player.setAttribute("aria-label", `Video: ${title}`);
		}

		if (picker) {
			picker.addEventListener("change", () => {
				if (!picker.value) return;
				const title = getVideoTitle(picker.value);
				setSource(encodeURIComponent(picker.value), title);
				if (status) status.textContent = title;
			});

			fetch("video-library.json")
				.then(response => {
					if (!response.ok) throw new Error("Video library unavailable");
					return response.json();
				})
				.then(filenames => {
					picker.replaceChildren();
					for (const filename of filenames) {
						const option = document.createElement("option");
						option.value = filename;
						option.textContent = getVideoTitle(filename);
						picker.append(option);
					}

					const initialVideo = picker.dataset.defaultVideo;
					if (initialVideo && filenames.includes(initialVideo)) {
						picker.value = initialVideo;
						setSource(encodeURIComponent(initialVideo), getVideoTitle(initialVideo));
					}
					if (status) status.textContent = `${filenames.length} video zinapatikana kwenye maktaba.`;
				})
				.catch(() => {
					picker.replaceChildren();
					picker.disabled = true;
					if (status) status.textContent = "Maktaba haikupatikana; bado unaweza kuchagua video kutoka kifaa.";
				});
		}

		if (fileInput) {
			fileInput.addEventListener("change", () => {
				const file = fileInput.files?.[0];
				if (!file) return;
				if (!file.type.startsWith("video/")) {
					if (status) status.textContent = "Chagua faili la video linalotambulika.";
					fileInput.value = "";
					return;
				}

				releaseLocalVideo();
				localObjectUrl = URL.createObjectURL(file);
				setSource(localObjectUrl, file.name);
				if (status) status.textContent = `${file.name} inachezwa kutoka kwenye kifaa hiki pekee.`;
			});
		}

		player.addEventListener("error", () => {
			if (status) status.textContent = "Video haikuweza kufunguliwa. Jaribu format nyingine.";
		});
		window.addEventListener("pagehide", releaseLocalVideo, { once: true });
	}

	for (const container of document.querySelectorAll("[data-internal-video]")) {
		initializePlayer(container);
	}
})();