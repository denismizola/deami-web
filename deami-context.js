(() => {
	const contentSections = document.querySelectorAll(".hero, main section, main article");
	const style = document.createElement("style");
	style.textContent = `
		.deami-context-link {
			display: inline-flex;
			align-items: center;
			gap: 7px;
			margin: 12px 0 0;
			padding: 8px 12px;
			border: 1px solid #b9d9ce;
			border-radius: 999px;
			background: #eff8f3;
			color: #145440;
			font: 700 0.82rem/1.3 "Segoe UI", sans-serif;
			text-decoration: none;
		}
		.deami-context-feed-link {
			position: absolute;
			z-index: 5;
			top: 56px;
			right: 12px;
			margin: 0;
			border-color: rgb(255 255 255 / 55%);
			background: rgb(18 58 48 / 92%);
			color: #fff;
		}
		.deami-context-feed-link:hover, .deami-context-feed-link:focus-visible {
			background: #1d7a5d;
			color: #fff;
		}
		.deami-context-link:hover, .deami-context-link:focus-visible {
			border-color: #28715a;
			background: #dff2e6;
		}
	`;
	document.head.append(style);

	function createAssistantUrl(title, summary) {
		const prompt = [
			`Nisaidie kuelewa sehemu "${title}" kwenye ukurasa "${document.title}".`,
			summary ? `Maudhui ya sehemu: ${summary}` : "",
			"Eleza maana yake kwa lugha rahisi, fafanua hoja muhimu na utoe mfano au hatua za vitendo. Tofautisha yaliyomo ukurasa na maelezo ya ziada; usibuni ukweli."
		].filter(Boolean).join("\n\n");
		const assistantUrl = new URL("Ai.html", window.location.href);
		assistantUrl.searchParams.set("prompt", prompt);
		assistantUrl.searchParams.set("source", title);
		return assistantUrl.href;
	}

	for (const section of contentSections) {
		if (section.closest(".feed") || section.hidden || section.querySelector(".deami-context-link")) continue;
		const heading = section.querySelector(":scope > h1, :scope > h2, :scope > h3, :scope > header h1, :scope > header h2, :scope > header h3, h1, h2, h3");
		if (!heading) continue;

		const title = heading.textContent.trim();
		if (!title) continue;
		const summary = [...section.querySelectorAll("p")]
			.map(paragraph => paragraph.textContent.trim())
			.find(text => text.length > 30)
			?.slice(0, 500) || "";
		const askLink = document.createElement("a");
		askLink.className = "deami-context-link";
		askLink.href = createAssistantUrl(title, summary);
		askLink.textContent = "✦ Uliza DEAMi Ai kuhusu sehemu hii";
		askLink.setAttribute("aria-label", `Uliza DEAMi Ai kuhusu ${title}`);
		heading.insertAdjacentElement("afterend", askLink);
	}

	const videoFeed = document.querySelector("main .feed");
	if (videoFeed) {
		const feedLink = document.createElement("a");
		feedLink.className = "deami-context-link deami-context-feed-link";
		feedLink.textContent = "✦ Uliza DEAMi Ai kuhusu video hii";
		feedLink.setAttribute("aria-label", "Uliza DEAMi Ai kuhusu video inayoonekana");

		function updateFeedLink() {
			const feedBounds = videoFeed.getBoundingClientRect();
			const feedCenter = feedBounds.top + feedBounds.height / 2;
			const visiblePosts = [...videoFeed.querySelectorAll(".video-post:not([hidden])")];
			const currentPost = visiblePosts
				.map(post => {
					const bounds = post.getBoundingClientRect();
					return { post, distance: Math.abs(bounds.top + bounds.height / 2 - feedCenter) };
				})
				.sort((first, second) => first.distance - second.distance)[0]?.post;
			const title = currentPost?.dataset.title || "Video fupi za D-link";
			const summary = currentPost?.dataset.caption || "Video fupi na maudhui yanayopatikana kwenye feed ya D-link.";
			feedLink.href = createAssistantUrl(title, summary.slice(0, 500));
			feedLink.setAttribute("aria-label", `Uliza DEAMi Ai kuhusu ${title}`);
		}

		videoFeed.parentElement.append(feedLink);
		videoFeed.addEventListener("scroll", updateFeedLink, { passive: true });
		videoFeed.addEventListener("scrollend", updateFeedLink);
		document.querySelectorAll("#feed-previous, #feed-next").forEach(button => {
			button.addEventListener("click", () => window.setTimeout(updateFeedLink, 700));
		});
		new MutationObserver(updateFeedLink).observe(videoFeed, { childList: true });
		updateFeedLink();
	}
})();
