export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ytIdsParam = searchParams.get("ytIds");

  if (!ytIdsParam) {
    return new Response(
      JSON.stringify({ error: "Missing ytIds query param (comma separated)" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server missing YOUTUBE_API_KEY" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const ytUrl =
    "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,status&id=" +
    encodeURIComponent(ytIdsParam) +
    "&key=" +
    encodeURIComponent(apiKey);

  const ytRes = await fetch(ytUrl, { next: { revalidate: 60 } });
  if (!ytRes.ok) {
    const text = await ytRes.text();
    return new Response(
      JSON.stringify({ error: "YouTube API error", detail: text }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  const data = await ytRes.json();
  const result = {};

  for (const item of data.items || []) {
    if (item?.status?.embeddable === false) continue;
    const thumbs = item?.snippet?.thumbnails || {};
    const bestThumb =
      thumbs?.maxres?.url ||
      thumbs?.standard?.url ||
      thumbs?.high?.url ||
      thumbs?.medium?.url ||
      thumbs?.default?.url ||
      null;
    result[item.id] = {
      title: item?.snippet?.title || null,
      channelTitle: item?.snippet?.channelTitle || null,
      publishedAt: item?.snippet?.publishedAt || null,
      viewCount: item?.statistics?.viewCount ? Number(item.statistics.viewCount) : null,
      thumbnailUrl: bestThumb,
      embeddable: item?.status?.embeddable !== false,
    };
  }

  return new Response(JSON.stringify({ videos: result }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}


