import axios from 'axios';
import { baseUrl as packagedBaseUrl } from './config';

// Runtime base url that can be overridden by the provider at startup
// normalize base url to avoid double-slashes when combining with request paths
export let runtimeBaseUrl = (packagedBaseUrl || '').replace(/\/+$/, '');
export function setRuntimeBaseUrl(url) {
  if (!url) return;
  runtimeBaseUrl = String(url).replace(/\/+$/, '');
}

export function getRuntimeBaseUrl() {
  return runtimeBaseUrl;
}

// Global request logging for all axios usage inside the SDK (helps debug 400s)
axios.interceptors.request.use((req) => {
  try {
    const info = {
      method: req.method,
      url: req.url,
      baseURL: req.baseURL,
      fullUrl: req.baseURL ? `${req.baseURL}${req.url}` : req.url,
      data: req.data,
      headers: req.headers,
    };
    // Keep logs short but informative
    console.log('[Petiqa SDK][AXIOS][REQUEST]', info.method, info.fullUrl || info.url);
    // Optionally log payload for debugging
    if (req.data) console.log('[Petiqa SDK][AXIOS][REQUEST DATA]', req.data);
  }
  catch (e) {
    // don't break requests because of logging
  }
  return req;
});

axios.interceptors.response.use((resp) => {
  try {
    console.log('[Petiqa SDK][AXIOS][RESPONSE]', resp.status, resp.config?.url || resp.config?.baseURL);
    // small response body sample
    if (resp.data) {
      try {
        const sample = typeof resp.data === 'object' ? JSON.stringify(resp.data).slice(0, 500) : String(resp.data).slice(0, 500);
        console.log('[Petiqa SDK][AXIOS][RESPONSE BODY]', sample);
      }
      catch (e) { }
    }
  }
  catch (e) {}
  return resp;
}, async (error) => {
  try {
    const cfg = error.config || {};
    console.error('[Petiqa SDK][AXIOS][ERROR]', cfg.method, cfg.url, 'status=', error.response?.status);
    if (error.response) {
      try { console.error('[Petiqa SDK][AXIOS][ERROR BODY]', JSON.stringify(error.response.data).slice(0, 1000)); } catch (e) {}
      // If the server rejected an identifier, try to auto-create the pet and retry once
      try {
        const respData = error.response.data || {};
        if (error.response.status === 400 && respData.errorCode === 'PETIQA.INVALID_IDENTIFIER') {
          const invalidId = respData.details && respData.details.id;
          // Only attempt auto-create/repair if the failing request url contains the invalid id
          if (invalidId && cfg && cfg.url && cfg.url.includes(`/pet/${invalidId}/`)) {
            console.log('[Petiqa SDK] Detected invalid identifier, attempting to create pet for:', invalidId);
            try {
              const createResp = await axios.post('/petiqa/pet', {
                petName: invalidId,
                initialStatus: { energy: 100, happiness: 100, hunger: 100, health: 100 },
                initialWallet: { coins: 10000, points: 1000 },
                initialInventory: {}
              }, { baseURL: runtimeBaseUrl });
              const newId = createResp?.data?.data?._id;
              if (newId) {
                // replace the invalid id in the original request URL and retry
                const newConfig = Object.assign({}, cfg);
                newConfig.url = String(newConfig.url).replace(`/pet/${invalidId}/`, `/pet/${newId}/`);
                newConfig.baseURL = runtimeBaseUrl;
                console.log('[Petiqa SDK] Retrying original request with new pet id:', newId);
                return axios.request(newConfig);
              }
            }
            catch (e) {
              // If create failed because the pet already exists (409), try to lookup by name and retry
              try {
                if (e && e.response && e.response.status === 409) {
                  console.log('[Petiqa SDK] Pet already exists, attempting lookup by name:', invalidId);
                  const lookupResp = await axios.get(`/petiqa/pet/by-name/${encodeURIComponent(invalidId)}`, { baseURL: runtimeBaseUrl });
                  // backend may return the document either under data.data or directly under data
                  const found = lookupResp?.data?.data ?? lookupResp?.data;
                  const foundId = found?._id;
                  if (foundId) {
                    const newConfig = Object.assign({}, cfg);
                    newConfig.url = String(newConfig.url).replace(`/pet/${invalidId}/`, `/pet/${foundId}/`);
                    newConfig.baseURL = runtimeBaseUrl;
                    console.log('[Petiqa SDK] Retrying original request with found pet id:', foundId);
                    return axios.request(newConfig);
                  }
                }
              }
              catch (e2) {
                console.error('[Petiqa SDK] Failed to lookup existing pet by name', invalidId, e2 && e2.message);
              }

              console.error('[Petiqa SDK] Failed to auto-create pet for invalid id', invalidId, e && e.message);
            }
          }
        }
      }
      catch (e) {
        // swallow auto-retry errors, fall through to reject
      }
    }
    else {
      console.error('[Petiqa SDK][AXIOS][ERROR MESSAGE]', error.message);
    }
  }
  catch (e) {}
  return Promise.reject(error);
});

// Export axios instance (the default axios) for convenience
export { axios };
