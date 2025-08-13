export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "mostPopular";
  const q = searchParams.get("q") || "";
  const maxResults = Math.min(Number(searchParams.get("maxResults")) || 24, 50);
  const regionCode = searchParams.get("regionCode") || "US";

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server missing YOUTUBE_API_KEY" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    if (mode === "mostPopular") {
      const url =
        `https://www.googleapis.com/youtube/v3/videos?` +
        new URLSearchParams({
          part: "snippet,statistics,status",
          chart: "mostPopular",
          regionCode,
          maxResults: String(maxResults),
          key: apiKey,
        }).toString();

      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const videos = (data.items || [])
        .filter((item) => item?.status?.embeddable !== false)
        .map((item) => {
        const thumbs = item?.snippet?.thumbnails || {};
        const bestThumb =
          thumbs?.maxres?.url ||
          thumbs?.standard?.url ||
          thumbs?.high?.url ||
          thumbs?.medium?.url ||
          thumbs?.default?.url ||
          null;
        return {
          id: item.id,
          title: item?.snippet?.title || null,
          channelTitle: item?.snippet?.channelTitle || null,
          publishedAt: item?.snippet?.publishedAt || null,
          viewCount: item?.statistics?.viewCount ? Number(item.statistics.viewCount) : null,
          thumbnailUrl: bestThumb,
          embeddable: item?.status?.embeddable !== false,
        };
      });
      return Response.json({ videos });
    }

    const searchUrl =
      `https://www.googleapis.com/youtube/v3/search?` +
      new URLSearchParams({
        part: "snippet",
        q,
        type: "video",
        maxResults: String(Math.min(maxResults, 25)),
        key: apiKey,
      }).toString();
    const sRes = await fetch(searchUrl, { next: { revalidate: 30 } });
    if (!sRes.ok) throw new Error(await sRes.text());
    const sData = await sRes.json();
    const ids = (sData.items || [])
      .map((i) => i?.id?.videoId)
      .filter(Boolean);
    if (!ids.length) return Response.json({ videos: [] });

    const vRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,status&id=${encodeURIComponent(ids.join(","))}&key=${encodeURIComponent(
        apiKey
      )}`,
      { next: { revalidate: 30 } }
    );
    if (!vRes.ok) throw new Error(await vRes.text());
    const vData = await vRes.json();
    const videos = (vData.items || [])
      .filter((item) => item?.status?.embeddable !== false)
      .map((item) => {
      const thumbs = item?.snippet?.thumbnails || {};
      const bestThumb =
        thumbs?.maxres?.url ||
        thumbs?.standard?.url ||
        thumbs?.high?.url ||
        thumbs?.medium?.url ||
        thumbs?.default?.url ||
        null;
      return {
        id: item.id,
        title: item?.snippet?.title || null,
        channelTitle: item?.snippet?.channelTitle || null,
        publishedAt: item?.snippet?.publishedAt || null,
        viewCount: item?.statistics?.viewCount ? Number(item.statistics.viewCount) : null,
        thumbnailUrl: bestThumb,
        embeddable: item?.status?.embeddable !== false,
      };
    });
    return Response.json({ videos });
  } catch (err) {
    return new Response(JSON.stringify({ error: "YouTube API error", detail: String(err) }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}


