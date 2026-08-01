(() => {
  'use strict';

  const API_ORIGIN = 'https://api.fxtwitter.com';
  const VERSION = '16';
  const MAX_CONCURRENCY = 5;
  const CACHE_TTL = 90000;
  const PROFILE_TTL = 600000;
  const nativeFetch = window.fetch.bind(window);
  const queue = [];
  const cache = new Map();
  let active = 0;

  const stats = {
    version: VERSION,
    requests: 0,
    cacheHits: 0,
    retries: 0,
    transformedStatuses: 0,
    transformedVideos: 0,
    lastError: ''
  };
  window.__luotxSourceAdapter = stats;

  function abortError() {
    try {
      return new DOMException('The operation was aborted.', 'AbortError');
    } catch {
      const error = new Error('The operation was aborted.');
      error.name = 'AbortError';
      return error;
    }
  }

  function pump() {
    while (active < MAX_CONCURRENCY && queue.length) {
      const job = queue.shift();
      if (job.signal?.aborted) {
        job.reject(abortError());
        continue;
      }
      active += 1;
      job.run().then(job.resolve, job.reject).finally(() => {
        active -= 1;
        pump();
      });
    }
  }

  function schedule(run, signal) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(abortError());
        return;
      }
      queue.push({ run, resolve, reject, signal });
      pump();
    });
  }

  function inferSize(url) {
    const match = String(url || '').match(/\/(\d{2,5})x(\d{2,5})\//);
    return match ? { width: Number(match[1]), height: Number(match[2]) } : { width: 0, height: 0 };
  }

  function normalizeFormat(format, video) {
    if (!format) return null;
    const url = String(format.url || format.src || '');
    if (!url) return null;
    const declared = String(format.container || format.content_type || format.type || '').toLowerCase();
    const isHls = declared.includes('m3u8') || declared.includes('mpegurl') || /\.m3u8(?:\?|$)/i.test(url);
    const isMp4 = declared.includes('mp4') || /\.mp4(?:\?|$)/i.test(url);
    if (!isHls && declared && !isMp4) return null;
    const inferred = inferSize(url);
    return {
      ...format,
      container: isHls ? 'm3u8' : 'mp4',
      url,
      width: Number(format.width || video?.width || video?.original_info?.width || inferred.width || 0),
      height: Number(format.height || video?.height || video?.original_info?.height || inferred.height || 0),
      bitrate: Number(format.bitrate || 0),
      size: Number(format.size || 0)
    };
  }

  function normalizeVideo(video) {
    if (!video) return null;
    const rawFormats = [
      ...(Array.isArray(video.formats) ? video.formats : []),
      ...(Array.isArray(video.variants) ? video.variants : []),
      ...(Array.isArray(video.video_info?.variants) ? video.video_info.variants : [])
    ];
    for (const url of [video.transcode_url, video.url]) {
      if (url && !rawFormats.some(item => item?.url === url)) rawFormats.push({ url });
    }
    const formats = [...new Map(
      rawFormats
        .map(item => normalizeFormat(item, video))
        .filter(Boolean)
        .map(item => [item.url, item])
    ).values()];
    if (!formats.length) return null;
    stats.transformedVideos += 1;
    return {
      ...video,
      type: video.type || 'video',
      thumbnail_url: video.thumbnail_url || video.poster || video.media_url_https || video.media_url || '',
      duration: Number(video.duration || (video.video_info?.duration_millis ? video.video_info.duration_millis / 1000 : 0) || 0),
      formats
    };
  }

  function normalizeStatus(status) {
    if (!status || typeof status !== 'object') return status;
    if (status.type === 'thread' && Array.isArray(status.statuses)) {
      return { ...status, statuses: status.statuses.map(normalizeStatus) };
    }
    const media = status.media || {};
    const candidates = [
      ...(Array.isArray(media.videos) ? media.videos : []),
      ...(Array.isArray(media.all)
        ? media.all.filter(item => ['video', 'gif', 'animated_gif'].includes(String(item?.type || '').toLowerCase()))
        : [])
    ];
    const videos = [...new Map(
      candidates
        .map(normalizeVideo)
        .filter(Boolean)
        .map((item, index) => [String(item.id || item.url || item.thumbnail_url || index), item])
    ).values()];
    stats.transformedStatuses += 1;
    return {
      ...status,
      media: { ...media, videos },
      quote: status.quote ? normalizeStatus(status.quote) : status.quote
    };
  }

  function normalizePayload(payload) {
    if (!payload || typeof payload !== 'object') return payload;
    const output = { ...payload };
    if (Array.isArray(payload.results)) output.results = payload.results.map(normalizeStatus);
    if (Array.isArray(payload.statuses)) output.statuses = payload.statuses.map(normalizeStatus);
    if (payload.status) output.status = normalizeStatus(payload.status);
    if (payload.tweet) output.tweet = normalizeStatus(payload.tweet);
    return output;
  }

  function cacheTtl(url) {
    if (/\/profile\/[^/]+(?:\?|$)/.test(url.pathname)) return PROFILE_TTL;
    if (/\/following(?:\?|$)/.test(url.pathname)) return PROFILE_TTL;
    return CACHE_TTL;
  }

  function rewriteUrl(original) {
    const url = new URL(original.toString());
    if (url.pathname === '/2/search') {
      const query = String(url.searchParams.get('q') || '').trim();
      if (query && !/filter\s*:\s*videos/i.test(query)) {
        url.searchParams.set('q', `(${query}) filter:videos -filter:replies`);
      }
      url.searchParams.set('feed', 'media');
      url.searchParams.set('count', '60');
    } else if (/\/2\/profile\/[^/]+\/media$/.test(url.pathname)) {
      url.searchParams.set('count', '60');
    } else if (/\/2\/profile\/[^/]+\/following$/.test(url.pathname)) {
      url.searchParams.set('count', '100');
    } else if (url.pathname === '/2/trends') {
      url.searchParams.set('count', '12');
    }
    return url;
  }

  async function fetchOnce(url, init) {
    return nativeFetch(url.toString(), {
      ...init,
      cache: 'no-store',
      headers: { Accept: 'application/json', ...(init?.headers || {}) }
    });
  }

  async function fetchWithFallback(url, originalUrl, init) {
    let response = await fetchOnce(url, init);
    if ((response.status === 429 || response.status >= 500) && !init?.signal?.aborted) {
      stats.retries += 1;
      await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 350));
      response = await fetchOnce(url, init);
    }

    if (!response.ok && url.pathname === '/2/search' && url.toString() !== originalUrl.toString()) {
      stats.retries += 1;
      response = await fetchOnce(originalUrl, init);
    }

    if (!response.ok && /\/2\/profile\/[^/]+\/media$/.test(url.pathname)) {
      const fallback = new URL(url.toString());
      fallback.pathname = fallback.pathname.replace(/\/media$/, '/statuses');
      fallback.searchParams.set('count', '100');
      stats.retries += 1;
      response = await fetchOnce(fallback, init);
    }
    return response;
  }

  function makeResponse(cached) {
    return new Response(cached.body, {
      status: cached.status,
      statusText: cached.statusText,
      headers: cached.headers
    });
  }

  async function handleApi(originalUrl, init) {
    const rewritten = rewriteUrl(originalUrl);
    const key = rewritten.toString();
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && now - cached.time < cacheTtl(rewritten)) {
      stats.cacheHits += 1;
      return makeResponse(cached);
    }

    stats.requests += 1;
    const response = await fetchWithFallback(rewritten, originalUrl, init);
    const text = await response.text();
    let body = text;
    if (text) {
      try {
        body = JSON.stringify(normalizePayload(JSON.parse(text)));
      } catch {
        body = text;
      }
    }
    const entry = {
      time: now,
      status: response.status,
      statusText: response.statusText,
      headers: { 'content-type': response.headers.get('content-type') || 'application/json' },
      body
    };
    if (response.ok) cache.set(key, entry);
    if (!response.ok) stats.lastError = `${response.status} ${rewritten.pathname}`;
    return makeResponse(entry);
  }

  window.fetch = function patchedFetch(input, init = {}) {
    let url;
    try {
      url = new URL(typeof input === 'string' ? input : input.url, location.href);
    } catch {
      return nativeFetch(input, init);
    }
    if (url.origin !== API_ORIGIN || !url.pathname.startsWith('/2/')) {
      return nativeFetch(input, init);
    }
    const signal = init.signal || (typeof input !== 'string' ? input.signal : undefined);
    return schedule(() => handleApi(url, { ...init, signal }), signal);
  };
})();
