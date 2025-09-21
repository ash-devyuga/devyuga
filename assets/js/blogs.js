const mediumContent = [
    {
        url: "https://medium.com/@ishubansal1400/the-modular-api-handler-pattern-scalable-frontend-service-calls-79dee191c273",
        category: "Technology - Frontend",
        time: "2025-09-19",
    },
    {
        url: "https://medium.com/@ishubansal1400/building-trustworthy-software-2f8c6674273a",
        category: "Technology - Software Best Practices",
        time: "2025-09-12",
    },
    {
        url: "https://medium.com/@ishubansal1400/the-subtle-pitfalls-of-react-state-management-b1185c46ce15",
        category: "Technology - Frontend",
        time: "2025-08-27",
    },
    {
        url: "https://medium.com/@ishubansal1400/react-is-declarative-how-to-think-in-react-194869b1493e",
        category: "Technology - Frontend",
        time: "2025-08-20",
    },
    {
        url: "https://medium.com/@ishubansal1400/stop-misusing-react-and-redux-a-call-for-thoughtful-frontend-development-d12fe7744ff1",
        category: "Technology - Frontend",
        time: "2025-07-14",
    },
    {
        url: "https://medium.com/@KumarHalder/openid-and-oauth-ff4d9347dd5f",
        category: "Technology - Authentication",
        time: "2024-03-07",
    },
    {
        url: "https://medium.com/@KumarHalder/token-based-authentication-in-web-applications-794d97056910",
        category: "Technology - Authentication",
        time: "2024-03-05",
    },
    {
        url: "https://medium.com/@KumarHalder/session-based-authentication-cookie-06a5f84c4c6b",
        category: "Technology - Authentication",
        time: "2024-03-02",
    }
];

async function fetchMetadata(url) {
    try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, "text/html");

    const title = doc.querySelector('meta[property="og:title"]')?.content || 'No title';
    const desc = doc.querySelector('meta[property="og:description"]')?.content || '';
    const image = doc.querySelector('meta[property="og:image"]')?.content || '';

    return { title, desc, image, url, category: 'Technology - Authentication', time: new Date().toISOString() };
    } catch (e) {
    console.error(e);
    return null;
    }
}

function articleTemplate(meta) {
    return `
        <article>
        <div class="post-img">
            <img src="${meta.image}" alt="${meta.title}"
            alt="blog image">
        </div>

        <p class="post-category">${meta.category}</p>

        <h2 class="title">
            <a href="${meta.url}">
            ${meta.title}
            </a>
        </h2>

        <p class="post-overview">
            ${meta.desc}
        </p>

        <div class="d-flex align-items-center">
            <div class="post-meta">
            <p class="post-date">
                <time datetime="${meta.time}">${new Date(meta.time).toDateString()}</time>
            </p>
            </div>
        </div>
        </article>
    `;
}

async function renderPosts() {
    const container = document.getElementById('medium-posts');
    for (let content of mediumContent) {
        const fetchedMeta = await fetchMetadata(content.url);
        if (!fetchedMeta) continue;
        const meta = {
            title: fetchedMeta.title || content.title,
            desc: fetchedMeta.desc || content.desc,
            image: fetchedMeta.image || content.image,
            url: fetchedMeta.url || content.url,
            category: content.category,
            time: content.time,
        };

        const postCard = document.createElement('div');
        postCard.className = 'col-xl-4 col-md-6';
        postCard.innerHTML = articleTemplate(meta);
        container.appendChild(postCard);
    }
}

async function articleHTML(content) {
    const fetchedMeta = await fetchMetadata(content.url);
    if (!fetchedMeta) return null;
    const meta = {
        title: fetchedMeta.title || content.title,
        desc: fetchedMeta.desc || content.desc,
        image: fetchedMeta.image || content.image,
        url: fetchedMeta.url || content.url,
        category: content.category,
        time: content.time,
    };
    return articleTemplate(meta);
}

const article = await articleHTML(mediumContent[1]);